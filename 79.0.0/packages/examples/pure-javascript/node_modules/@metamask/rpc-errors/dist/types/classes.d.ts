import type { JsonRpcError as SerializedJsonRpcError } from '@metamask/utils';
import type { OptionalDataWithOptionalCause } from './utils';
export type { SerializedJsonRpcError };
/**
 * Error subclass implementing JSON RPC 2.0 errors and Ethereum RPC errors
 * per EIP-1474.
 *
 * Permits any integer error code.
 */
export declare class JsonRpcError<Data extends OptionalDataWithOptionalCause> extends Error {
    code: number;
    data?: Data;
    constructor(code: number, message: string, data?: Data);
    /**
     * Get the error as JSON-serializable object.
     *
     * @returns A plain object with all public class properties.
     */
    serialize(): SerializedJsonRpcError;
    /**
     * Get a string representation of the serialized error, omitting any circular
     * references.
     *
     * @returns A string representation of the serialized error.
     */
    toString(): string;
}
/**
 * Error subclass implementing Ethereum Provider errors per EIP-1193.
 * Permits integer error codes in the [ 1000 <= 4999 ] range.
 */
export declare class EthereumProviderError<Data extends OptionalDataWithOptionalCause> extends JsonRpcError<Data> {
    /**
     * Create an Ethereum Provider JSON-RPC error.
     *
     * @param code - The JSON-RPC error code. Must be an integer in the
     * `1000 <= n <= 4999` range.
     * @param message - The JSON-RPC error message.
     * @param data - Optional data to include in the error.
     */
    constructor(code: number, message: string, data?: Data);
}
//# sourceMappingURL=classes.d.ts.map