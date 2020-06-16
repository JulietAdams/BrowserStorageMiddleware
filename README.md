# Redux Browser Storage Middlware

A [Redux Middleware](https://redux.js.org/advanced/middleware) used for storing state in either local or session strorage.

## Installation

```bash
npm install --save browserstoragemiddlware
```

## Usage

This package has two main exports: `createBrowswerStorageMiddleware` and `rehydrateStore`. It is totally optional to use `rehydrateStore` and instead use your own rehydrate method, if you want to do this checkout the docs for rehydrate store below. 

The default type of storage used is `sessionStorage`.

Browser storage capacities vary by browser, storage type and host. Use [this](http://dev-test.nemikor.com/web-storage/support-test/) handy storage capacity calculator for more precise and browser + host specific storage capacities. If you want to learn more about the differences between local and session storage refer to [this](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API).

### createBrowserStorageMiddlware

The middleware constructor is a generic and expects two types
 1. Your `State` type
 2. A type union of the types for each value to be stored in the browser. Using any is fine for simple cases - but if you add a custom serialize method it can be very useful to use a type union. 

Basic usage for a single module:

```javascript

type State = {
  module1: { key1: string, key2: number[], key3: boolean },
  ...
};

const middleware = createBrowswerStorageMiddleware<State, string>('module1', ['key1', 'key3'])

```


If you have multiple modules:

```javascript

type State = {
  module1: { key1: string, key2: boolean },
  module2: { key1: number, key2: string } 
};

const module1Middleware = createBrowswerStorageMiddleware<State, string>('module1', ['key1'])
const module2Middleware = createBrowswerStorageMiddleware<State, string | number>('module2', ['key1', 'key2'])

```

### rehydrateStore

This method is used to parse the values stored in the browser and initialize the redux store with those values. This method is also generic and expects a single type: A type union of the types for each value stored in the browser. Using any is fine for simple cases - but if you add a custom parse method it can be very useful to use a type union. 

The only required argument is the list of modules with values stored in the browser.

Basic usage:

```javascript

const hydratedState = rehydrateStore<string | number>([module1, module2, ...])

```

A full example of usage with `createBrowserStorageMiddleware` 

```javascript
import {
  createStore,
  applyMiddleware,
  compose,
} from 'redux'

type State = {
  module1: { key1: string, key2: boolean },
  module2: { key1: number, key2: string } 
};

const module1Middleware = createBrowswerStorageMiddleware<State, string>('module1', ['key1'])
const module2Middleware = createBrowswerStorageMiddleware<State, string | number>('module2', ['key1', 'key2'])

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(
  reducer,
  rehydrateStore<string | number>(['module1', 'module2']),
  composeEnhancers(
    applyMiddleware(
      module1Middleware,
      module2Middleware
    ),
  )
)

```

### Configs

#### `createBrowserStorageMiddleware` config

```javascript
export type MiddlewareConfig<T> = {
  serialize: (key: string, value: T) => string,
  interval: number,
  storage: 'local' | 'session'
}
```

Where T is the type union of the types for each value stored in browser storage. For most simple cases you can set this to any it is really only going to useful if you want to write custom serialize method.

##### `interval`

This is the throttle interval.

Expects a number in `ms`. Defaults to `0`

##### `serialize`

The serialization method to be used when storing the values in the browser.

Expects a method with type `(key: string, value: T) => string` where T is the type union of the types for each value stored in browser storage


The default serialize method is

```javascript
JSON.stringify(value, (_, subVal) => {
   if(subVal instanceof Set) {
     return {arr: Array.from(subVal), _isSet: true}
   }
   return subVal
 }
```

The transform for sets is added due to  `JSON.stringify` not supporting sets.

##### `errorHandler`

A custom error handler. Expected a method with one argument of type `Error`.

By default any runtime errors encountered will be thrown as expected. 

##### `storage`

The type of browser storage to use.

Expects either 'session' or 'local'. Defaults to `'session'`

-----

### `rehydrateStore` config

```javascript
export type RehydratorConfig<S, T> = {
  parse: (value: string) => T,
  initialState?: Partial<S>,
  storage: 'local' | 'session'
}
```

###### `initalState`

The inital value for your entire state. This will be merged using ramda's `mergeDeep` method so nested objects will be merged recursively.

Expects a partial of your state. Defaults to {}

##### `parse`

The parse method to be used when retrieving stored values from the browser.

Expects a method with type `(value: string) => T` where T is the type union of the types for each value stored in browser storage

The default parse method is
```javascript
JSON.parse(value, (_, subValue) => {
  if(typeof subValue === 'object') {
    if(subValue['_isSet']) {
      return new Set(subValue['arr'])
    }
  }
  return subValue
 })
```

The default accounts for `JSON.parse` not supporting sets and will insetad parse any objects that look like `{arr: any[],  _isSet: true }` as `new Set(arr)`. 


##### `errorHandler`

A custom error handler. Expected a method with one argument of type `Error`.

By default any runtime errors encountered will be thrown as expected. 


##### `storage`

The type of browser storage to use.

Expects either 'session' or 'local'. Defaults to `'session'`

## License

MIT
