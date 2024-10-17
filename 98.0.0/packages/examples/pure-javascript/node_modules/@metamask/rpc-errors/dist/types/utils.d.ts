import type { Json, JsonRpcError as SerializedJsonRpcError } from '@metamask/utils';
/**
 * A data object, that must be either:
 *
 * - A JSON-serializable object.
 * - An object with a `cause` property that is an error-like value, and any
 * other properties that are JSON-serializable.
 */
export type DataWithOptionalCause = Json | {
    [key: string]: Json | unknown;
    cause?: unknown;
};
/**
 * A data object, that must be either:
 *
 * - A valid DataWithOptionalCause value.
 * - undefined.
 */
export type OptionalDataWithOptionalCause = undefined | DataWithOptionalCause;
export declare const JSON_RPC_SERVER_ERROR_MESSAGE = "Unspecified server error.";
/**
 * Gets the message for a given code, or a fallback message if the code has
 * no corresponding message.
 *
 * @param code - The error code.
 * @param fallbackMessage - The fallback message to use if the code has no
 * corresponding message.
 * @returns The message for the given code, or the fallback message if the code
 * has no corresponding message.
 */
export declare function getMessageFromCode(code: unknown, fallbackMessage?: string): string;
/**
 * Returns whether the given code is valid.
 * A code is valid if it is an integer.
 *
 * @param code - The error code.
 * @returns Whether the given code is valid.
 */
export declare function isValidCode(code: unknown): code is number;
/**
 * Serializes the given error to an Ethereum JSON RPC-compatible error object.
 * If the given error is not fully compatible, it will be preserved on the
 * returned object's data.cause property.
 *
 * @param error - The error to serialize.
 * @param options - Options bag.
 * @param options.fallbackError - The error to return if the given error is
 * not compatible. Should be a JSON serializable value.
 * @param options.shouldIncludeStack - Whether to include the error's stack
 * on the returned object.
 * @returns The serialized error.
 */
export declare function serializeError(error: unknown, { fallbackError, shouldIncludeStack }?: {
    fallbackError?: SerializedJsonRpcError | undefined;
    shouldIncludeStack?: boolean | undefined;
}): SerializedJsonRpcError;
/**
 * Serializes an unknown error to be used as the `cause` in a fallback error.
 *
 * @param error - The unknown error.
 * @returns A JSON-serializable object containing as much information about the original error as possible.
 */
export declare function serializeCause(error: unknown): Json;
//# sourceMappingURL=utils.d.ts.map