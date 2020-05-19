/**
 * Config for middleware.
 * T can be `any` or type union and is the type of the second arg for the serialize.
 */
export type MiddlewareConfig<T> = {
  serialize: (key: string, value: T) => string;
  interval: number;
  storage: 'local' | 'session';
}

/**
 * Config for the rehydrateStore function.
 * S is State. T can be `any` or type union and is return type of the parse.
 */
export type RehydratorConfig<S, T> = {
  parse: (value: string) => T;
  initialState?: Partial<S>;
  storage: 'local' | 'session';
}