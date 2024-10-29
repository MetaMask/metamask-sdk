import { JsonRpcError, EthereumProviderError } from './classes';
import type { OptionalDataWithOptionalCause } from './utils';
type EthereumErrorOptions<Data extends OptionalDataWithOptionalCause> = {
    message?: string;
    data?: Data;
};
type ServerErrorOptions<Data extends OptionalDataWithOptionalCause> = {
    code: number;
} & EthereumErrorOptions<Data>;
type CustomErrorArg<Data extends OptionalDataWithOptionalCause> = ServerErrorOptions<Data>;
type JsonRpcErrorsArg<Data extends OptionalDataWithOptionalCause> = EthereumErrorOptions<Data> | string;
export declare const rpcErrors: {
    /**
     * Get a JSON RPC 2.0 Parse (-32700) error.
     *
     * @param arg - The error message or options bag.
     * @returns An instance of the {@link JsonRpcError} class.
     */
    parse: <Data extends OptionalDataWithOptionalCause>(arg?: JsonRpcErrorsArg<Data> | undefined) => JsonRpcError<Data>;
    /**
     * Get a JSON RPC 2.0 Invalid Request (-32600) error.
     *
     * @param arg - The error message or options bag.
     * @returns An instance of the {@link JsonRpcError} class.
     */
    invalidRequest: <Data_1 extends OptionalDataWithOptionalCause>(arg?: JsonRpcErrorsArg<Data_1> | undefined) => JsonRpcError<Data_1>;
    /**
     * Get a JSON RPC 2.0 Invalid Params (-32602) error.
     *
     * @param arg - The error message or options bag.
     * @returns An instance of the {@link JsonRpcError} class.
     */
    invalidParams: <Data_2 extends OptionalDataWithOptionalCause>(arg?: JsonRpcErrorsArg<Data_2> | undefined) => JsonRpcError<Data_2>;
    /**
     * Get a JSON RPC 2.0 Method Not Found (-32601) error.
     *
     * @param arg - The error message or options bag.
     * @returns An instance of the {@link JsonRpcError} class.
     */
    methodNotFound: <Data_3 extends OptionalDataWithOptionalCause>(arg?: JsonRpcErrorsArg<Data_3> | undefined) => JsonRpcError<Data_3>;
    /**
     * Get a JSON RPC 2.0 Internal (-32603) error.
     *
     * @param arg - The error message or options bag.
     * @returns An instance of the {@link JsonRpcError} class.
     */
    internal: <Data_4 extends OptionalDataWithOptionalCause>(arg?: JsonRpcErrorsArg<Data_4> | undefined) => JsonRpcError<Data_4>;
    /**
     * Get a JSON RPC 2.0 Server error.
     * Permits integer error codes in the [ -32099 <= -32005 ] range.
     * Codes -32000 through -32004 are reserved by EIP-1474.
     *
     * @param opts - The error options bag.
     * @returns An instance of the {@link JsonRpcError} class.
     */
    server: <Data_5 extends OptionalDataWithOptionalCause>(opts: ServerErrorOptions<Data_5>) => JsonRpcError<Data_5>;
    /**
     * Get an Ethereum JSON RPC Invalid Input (-32000) error.
     *
     * @param arg - The error message or options bag.
     * @returns An instance of the {@link JsonRpcError} class.
     */
    invalidInput: <Data_6 extends OptionalDataWithOptionalCause>(arg?: JsonRpcErrorsArg<Data_6> | undefined) => JsonRpcError<Data_6>;
    /**
     * Get an Ethereum JSON RPC Resource Not Found (-32001) error.
     *
     * @param arg - The error message or options bag.
     * @returns An instance of the {@link JsonRpcError} class.
     */
    resourceNotFound: <Data_7 extends OptionalDataWithOptionalCause>(arg?: JsonRpcErrorsArg<Data_7> | undefined) => JsonRpcError<Data_7>;
    /**
     * Get an Ethereum JSON RPC Resource Unavailable (-32002) error.
     *
     * @param arg - The error message or options bag.
     * @returns An instance of the {@link JsonRpcError} class.
     */
    resourceUnavailable: <Data_8 extends OptionalDataWithOptionalCause>(arg?: JsonRpcErrorsArg<Data_8> | undefined) => JsonRpcError<Data_8>;
    /**
     * Get an Ethereum JSON RPC Transaction Rejected (-32003) error.
     *
     * @param arg - The error message or options bag.
     * @returns An instance of the {@link JsonRpcError} class.
     */
    transactionRejected: <Data_9 extends OptionalDataWithOptionalCause>(arg?: JsonRpcErrorsArg<Data_9> | undefined) => JsonRpcError<Data_9>;
    /**
     * Get an Ethereum JSON RPC Method Not Supported (-32004) error.
     *
     * @param arg - The error message or options bag.
     * @returns An instance of the {@link JsonRpcError} class.
     */
    methodNotSupported: <Data_10 extends OptionalDataWithOptionalCause>(arg?: JsonRpcErrorsArg<Data_10> | undefined) => JsonRpcError<Data_10>;
    /**
     * Get an Ethereum JSON RPC Limit Exceeded (-32005) error.
     *
     * @param arg - The error message or options bag.
     * @returns An instance of the {@link JsonRpcError} class.
     */
    limitExceeded: <Data_11 extends OptionalDataWithOptionalCause>(arg?: JsonRpcErrorsArg<Data_11> | undefined) => JsonRpcError<Data_11>;
};
export declare const providerErrors: {
    /**
     * Get an Ethereum Provider User Rejected Request (4001) error.
     *
     * @param arg - The error message or options bag.
     * @returns An instance of the {@link EthereumProviderError} class.
     */
    userRejectedRequest: <Data extends OptionalDataWithOptionalCause>(arg?: JsonRpcErrorsArg<Data> | undefined) => EthereumProviderError<Data>;
    /**
     * Get an Ethereum Provider Unauthorized (4100) error.
     *
     * @param arg - The error message or options bag.
     * @returns An instance of the {@link EthereumProviderError} class.
     */
    unauthorized: <Data_1 extends OptionalDataWithOptionalCause>(arg?: JsonRpcErrorsArg<Data_1> | undefined) => EthereumProviderError<Data_1>;
    /**
     * Get an Ethereum Provider Unsupported Method (4200) error.
     *
     * @param arg - The error message or options bag.
     * @returns An instance of the {@link EthereumProviderError} class.
     */
    unsupportedMethod: <Data_2 extends OptionalDataWithOptionalCause>(arg?: JsonRpcErrorsArg<Data_2> | undefined) => EthereumProviderError<Data_2>;
    /**
     * Get an Ethereum Provider Not Connected (4900) error.
     *
     * @param arg - The error message or options bag.
     * @returns An instance of the {@link EthereumProviderError} class.
     */
    disconnected: <Data_3 extends OptionalDataWithOptionalCause>(arg?: JsonRpcErrorsArg<Data_3> | undefined) => EthereumProviderError<Data_3>;
    /**
     * Get an Ethereum Provider Chain Not Connected (4901) error.
     *
     * @param arg - The error message or options bag.
     * @returns An instance of the {@link EthereumProviderError} class.
     */
    chainDisconnected: <Data_4 extends OptionalDataWithOptionalCause>(arg?: JsonRpcErrorsArg<Data_4> | undefined) => EthereumProviderError<Data_4>;
    /**
     * Get a custom Ethereum Provider error.
     *
     * @param opts - The error options bag.
     * @returns An instance of the {@link EthereumProviderError} class.
     */
    custom: <Data_5 extends OptionalDataWithOptionalCause>(opts: CustomErrorArg<Data_5>) => EthereumProviderError<Data_5>;
};
export {};
//# sourceMappingURL=errors.d.ts.map