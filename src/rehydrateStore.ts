import { path, assocPath, mergeDeepRight } from 'ramda'
import { RehydratorConfig } from './types'
import { hasStorage, defaultParser } from './utils'

/**
 * Method that expects a list of module names that have values in browser storage to retrieve and use to rehydrate the redux store.
 * @param subTrees the names of the redux subtree that have values stored in browser storage
 * @param config Configuration options. See [docs](https://github.com/JulietAdams/BrowserStorageMiddleware#configs) for details
 */
export function rehydrateStore<S, T> (moduleNames: string[], config?: Partial<RehydratorConfig<S, T>>): Partial<S> {
  if(!hasStorage(config?.storage || 'session')) {
    return config?.initialState || {}
  }
  return moduleNames.reduce<Partial<S>>((initialReduxState, key) => {
    try {
      const item = config?.storage === 'local' ? localStorage.getItem(key) : sessionStorage.getItem(key)
      if(item !== null) {
        const state = config?.parse ? config.parse(item) : defaultParser(item)
        if(typeof state === 'object') {
          const initalModuleState = config?.initialState ? path<object>([key], config.initialState) : {}
          const moduleState = Object.entries(state as object).reduce<object>((acc, [subKey, subValue]) => {
            acc = assocPath([subKey], config?.parse ? config.parse(subValue) : defaultParser(subValue), acc)
            return acc
          }, {})
          initialReduxState = { ...initialReduxState, [key]: initalModuleState ? mergeDeepRight(initalModuleState, moduleState) : moduleState}
        }
      }
      return initialReduxState
    } catch (e) {
      if(config?.errorHandler) {
        config.errorHandler(e)
        return initialReduxState
      }

      if(config?.storage === 'local') {
        localStorage.clear()
      } else {
        sessionStorage.clear()
      }
      return initialReduxState
    }
  }, config?.initialState || {})
}
