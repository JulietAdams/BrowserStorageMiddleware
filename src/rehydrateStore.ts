import { path, assocPath, mergeDeepRight } from 'ramda'
import { RehydratorConfig } from '../types'


const defaultDeserializer = (value: string) => JSON.parse(value, (_, subValue) => {
  if(typeof subValue === 'object') {
    if(subValue['_isSet']) {
      return new Set(subValue['arr'])
    }
  }
  return subValue
})


/**
 * Method that expects a list of module names that have values in browser storage to retrieve and use to rehydrate the redux store. 
 * @param subTrees the names of the redux subtree that have values stored in browser storage
 * @param config Configuration options. See docs for details
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
