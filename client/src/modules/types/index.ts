import moment, { Moment } from "moment";

export * from "./constants";
export * from "./serviceCommon";
export * from "./models";

/**
 * Generic type for wrapping top-level data that can be fetched from the service. Stores
 * metadata about whether the content is in the process of loading or if it previously
 * ran into an error.
 */
export type Module<T> = Readonly<{
    isLoading: boolean;
    lastFetched?: Moment;
    lastError?: any;
    data: T;
}>;

/**
 * Helper type for reducer actions
 */
export type Action = Readonly<{
    type: string;
    payload?: any;
    timestamp: Moment;
}>;

export const shouldRefreshModule = <T>(module: Module<T>, timeoutSeconds: number): boolean => 
    !module.isLoading && (!module.lastFetched || moment.utc().diff(module.lastFetched, 'seconds') > timeoutSeconds);