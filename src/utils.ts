export const throttle = <T extends unknown[]>(fn: (...x: T) => void, interval: number) => {
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

export const hasStorage = (type: 'session' | 'local') => {
  const uid = new Date()
  const storage = type === 'local' ? localStorage : sessionStorage 
  try {
    storage.setItem('uid', uid.toDateString())
    const test = storage.getItem('uid') === uid.toDateString()
    storage.removeItem('uid')
    return test
  } catch {
    return false
  }
}

export const defaultParser = (value: string) => JSON.parse(value, (_, subValue) => {
  if(typeof subValue === 'object') {
    if(subValue['_isSet']) {
      return new Set(subValue['arr'])
    }
  }
  return subValue
})

export function defaultSerializer<T> (key: string, value: T) {
  return JSON.stringify(value, (_, subValue) => {
    if(subValue instanceof Set) {
      return {arr: Array.from(subValue), _isSet: true}
    }
    return subValue
  })
}
