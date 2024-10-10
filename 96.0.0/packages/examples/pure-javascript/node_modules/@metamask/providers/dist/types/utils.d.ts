import type { JsonRpcMiddleware } from '@metamask/json-rpc-engine';
import type { Json, JsonRpcParams, PendingJsonRpcResponse } from '@metamask/utils';
export declare type Maybe<Type> = Partial<Type> | null | undefined;
export declare type ConsoleLike = Pick<Console, 'log' | 'warn' | 'error' | 'debug' | 'info' | 'trace'>;
export declare const EMITTED_NOTIFICATIONS: readonly string[];
/**
 * Gets the default middleware for external providers, consisting of an ID
 * remapping middleware and an error middleware.
 *
 * @param logger - The logger to use in the error middleware.
 * @returns An array of @metamask/json-rpc-engine middleware functions.
 */
export declare const getDefaultExternalMiddleware: (logger?: ConsoleLike) => JsonRpcMiddleware<JsonRpcParams, Json>[];
export declare const getRpcPromiseCallback: (resolve: (value?: any) => void, reject: (error?: Error) => void, unwrapResult?: boolean) => (error: Error, response: PendingJsonRpcResponse<Json>) => void;
/**
 * Checks whether the given chain ID is valid, meaning if it is non-empty,
 * '0x'-prefixed string.
 *
 * @param chainId - The chain ID to validate.
 * @returns Whether the given chain ID is valid.
 */
export declare const isValidChainId: (chainId: unknown) => chainId is string;
/**
 * Checks whether the given network version is valid, meaning if it is non-empty
 * string.
 *
 * @param networkVersion - The network version to validate.
 * @returns Whether the given network version is valid.
 */
export declare const isValidNetworkVersion: (networkVersion: unknown) => networkVersion is string;
export declare const NOOP: () => undefined;
//# sourceMappingURL=utils.d.ts.map