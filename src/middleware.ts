import { MiddlewareAPI, Dispatch, AnyAction } from 'redux'
import { path, equals } from 'ramda'
import { MiddlewareConfig } from './types'
import { hasStorage, throttle, defaultSerializer } from './utils'

/**
 * Middleware that will store properties within a redux subtree to local or session storage.
 * @param moduleName name of redux subtree
 * @param paths paths to the resources within the subtree
 * @param config  Middleware config. See [docs](https://github.com/JulietAdams/BrowserStorageMiddleware#configs) for defaults
 */
export function createBrowserStorageMiddleware<S, T> (moduleName: string, paths: string[], config?: Partial<MiddlewareConfig<T>>) {
  return (api: MiddlewareAPI<Dispatch<AnyAction>, S>) => {
    if(!hasStorage(config?.storage || 'session')) {
      return (next: Dispatch<AnyAction>) => (action: AnyAction) => next(action)
    }

    const throttledMiddleware = throttle((prevState: S) => {
      const nextState = api.getState()
      const value = paths.reduce<{[key: string]: string}>((acc, subtreePath) => {
        const previousSubtree = path<T>([moduleName, subtreePath], prevState)
        const nextSubtree = path<T>([moduleName, subtreePath], nextState)
        if (!equals(previousSubtree, nextSubtree) && nextSubtree !== undefined) {
          const value = config?.serialize ? config.serialize(subtreePath, nextSubtree) : defaultSerializer(subtreePath, nextSubtree)
          acc[subtreePath] = value
        }
        return acc
      }, {})

      if(Object.keys(value).length > 0) {
        try {
          if(config?.storage === 'local') {
            const prev = localStorage.getItem(moduleName)
            localStorage.setItem(moduleName, JSON.stringify( prev !== null ? { ...JSON.parse(prev), ...value} : value))
          } else {
            const prev = sessionStorage.getItem(moduleName)
            sessionStorage.setItem(moduleName, JSON.stringify( prev !== null ? { ...JSON.parse(prev), ...value} : value))
          }
        } catch(e) {
          if(config?.errorHandler) {
            config.errorHandler(e)
          } else {
            throw Error(e)
          }
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
