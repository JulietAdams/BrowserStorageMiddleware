import { MiddlewareAPI, Dispatch, AnyAction } from "redux"

/**
 * Config for middleware. 
 * T can be `any` or type union and is the type of the second arg for the serializer.
 */
export type MiddlewareConfig<T> = {
  serializer: (key: string, value: T) => string;
  interval: number;
  storage: 'local' | 'session';
}

/**
 * Config for the rehydrateStore function. 
 * S is State. T can be `any` or type union and is return type of the deserializer.
 */
export type RehydratorConfig<S, T> = {
  deserializer: (value: string) => T;
  initialState?: Partial<S>;
  storage: 'local' | 'session';
}