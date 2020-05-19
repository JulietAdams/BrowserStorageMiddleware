import { MiddlewareAPI, Dispatch, AnyAction } from 'redux'
import { path, assocPath, mergeDeepRight, equals } from 'ramda'
import { RehydratorConfig, MiddlewareConfig } from '../types'

const throttle = <T extends unknown[]>(fn: (...x: T) => void, interval: number) => {
  let args: T | undefined

  return (...x: T) => {
    if (args === undefined) {
      setTimeout(() => {
        fn(...args as T)
        args = undefined
      }, interval)
    }
    args = x
  }
}

function defaultSerializer<T> (key: string, value: T) {
  return JSON.stringify(value, (_, subValue) => {
    if(subValue instanceof Set) {
      return {arr: Array.from(subValue), _isSet: true}
    }
    return subValue
  })
}

const defaultDeserializer = (value: string) => JSON.parse(value, (_, subValue) => {
  if(typeof subValue === 'object') {
    if(subValue['_isSet']) {
      return new Set(subValue['arr'])
    }
  }
  return subValue
})

/**
 * Middleware that will store properties within a redux subtree to local or session storage.
 * @param moduleName name of redux subtree
 * @param paths paths to the resources within the subtree
 * @param config  Middleware config. See docs for defaults
 */
export function createSessionStorageMiddleware<S, T> (moduleName: string, paths: string[], config?: Partial<MiddlewareConfig<T>>) {
  return (api: MiddlewareAPI<Dispatch<AnyAction>, S>) => {
    const throttledMiddleware = throttle((prevState: S) => {
      const nextState = api.getState()
      const value = paths.reduce<{[key: string]: string}>((acc, subtreePath) => {
        const previousSubtree = path<T>([moduleName, subtreePath], prevState)
        const nextSubtree = path<T>([moduleName, subtreePath], nextState)
        if (!equals(previousSubtree, nextSubtree) && nextSubtree !== undefined) {
          const value = config?.serializer ? config.serializer(subtreePath, nextSubtree) : defaultSerializer(subtreePath, nextSubtree)
          acc[subtreePath] = value
        }
        return acc
      }, {})

      if(Object.keys(value).length > 0) {
        if(config?.storage === 'local') {
          const prev = localStorage.getItem(moduleName)
          localStorage.setItem(moduleName, JSON.stringify( prev !== null ? { ...JSON.parse(prev), ...value} : value))
        } else {
          const prev = sessionStorage.getItem(moduleName)
          sessionStorage.setItem(moduleName, JSON.stringify( prev !== null ? { ...JSON.parse(prev), ...value} : value))
        }
      }
    }, config?.interval ? config.interval : 0)
    return (next: Dispatch<AnyAction>) => (action: AnyAction) => {
      const prev = api.getState()
      const result = next(action)
      throttledMiddleware(prev)
      return result
    }
  }
}

/**
 * 
 * @param subTrees 
 * @param config 
 */
export function rehydrateStore<S, T> (moduleNames: string[], config?: Partial<RehydratorConfig<S, T>>): Partial<S> {
  return moduleNames.reduce<Partial<S>>((initialReduxState, key) => {
    try {
      const item = config?.storage === 'local' ? localStorage.getItem(key) : sessionStorage.getItem(key)
      if(item !== null) {
        const state = config?.deserializer ? config.deserializer(item) : defaultDeserializer(item)
        if(typeof state === 'object') {
          const initalModuleState = config?.initialState ? path<object>([key], config.initialState) : {}
          const moduleState = Object.entries(state as object).reduce<object>((acc, [subKey, subValue]) => {
            acc = assocPath([subKey], config?.deserializer ? config.deserializer(subValue) : defaultDeserializer(subValue), acc)
            return acc
          }, {})
          initialReduxState = { ...initialReduxState, [key]: initalModuleState ? mergeDeepRight(initalModuleState, moduleState) : moduleState}
        }
      }
      return initialReduxState
    } catch (e) {
      return initialReduxState
    }
  }, config?.initialState || {})
}
