/// <reference types="node" />
import type { Json, JsonRpcRequest, JsonRpcResponse } from '@metamask/utils';
import type { Duplex } from 'readable-stream';
import type { UnvalidatedJsonRpcRequest } from './BaseProvider';
import type { StreamProviderOptions } from './StreamProvider';
import { AbstractStreamProvider } from './StreamProvider';
export declare type SendSyncJsonRpcRequest = {
    method: 'eth_accounts' | 'eth_coinbase' | 'eth_uninstallFilter' | 'net_version';
} & JsonRpcRequest;
export declare type MetaMaskInpageProviderOptions = {
    /**
     * Whether the provider should send page metadata.
     */
    shouldSendMetadata?: boolean;
    jsonRpcStreamName?: string | undefined;
} & Partial<Omit<StreamProviderOptions, 'rpcMiddleware'>>;
declare type SentWarningsState = {
    chainId: boolean;
    networkVersion: boolean;
    selectedAddress: boolean;
    enable: boolean;
    experimentalMethods: boolean;
    send: boolean;
    events: {
        close: boolean;
        data: boolean;
        networkChanged: boolean;
        notification: boolean;
    };
};
/**
 * The name of the stream consumed by {@link MetaMaskInpageProvider}.
 */
export declare const MetaMaskInpageProviderStreamName = "metamask-provider";
export declare class MetaMaskInpageProvider extends AbstractStreamProvider {
    #private;
    protected _sentWarnings: SentWarningsState;
    /**
     * Experimental methods can be found here.
     */
    readonly _metamask: ReturnType<MetaMaskInpageProvider['_getExperimentalApi']>;
    /**
     * Indicating that this provider is a MetaMask provider.
     */
    readonly isMetaMask: true;
    /**
     * Creates a new `MetaMaskInpageProvider`.
     *
     * @param connectionStream - A Node.js duplex stream.
     * @param options - An options bag.
     * @param options.jsonRpcStreamName - The name of the internal JSON-RPC stream.
     * Default: `metamask-provider`.
     * @param options.logger - The logging API to use. Default: `console`.
     * @param options.maxEventListeners - The maximum number of event
     * listeners. Default: 100.
     * @param options.shouldSendMetadata - Whether the provider should
     * send page metadata. Default: `true`.
     */
    constructor(connectionStream: Duplex, { jsonRpcStreamName, logger, maxEventListeners, shouldSendMetadata, }?: MetaMaskInpageProviderOptions);
    get chainId(): string | null;
    get networkVersion(): string | null;
    get selectedAddress(): string | null;
    /**
     * Submits an RPC request per the given JSON-RPC request object.
     *
     * @param payload - The RPC request object.
     * @param callback - The callback function.
     */
    sendAsync(payload: JsonRpcRequest, callback: (error: Error | null, result?: JsonRpcResponse<Json>) => void): void;
    /**
     * We override the following event methods so that we can warn consumers
     * about deprecated events:
     * `addListener`, `on`, `once`, `prependListener`, `prependOnceListener`.
     */
    addListener(eventName: string, listener: (...args: unknown[]) => void): this;
    on(eventName: string, listener: (...args: unknown[]) => void): this;
    once(eventName: string, listener: (...args: unknown[]) => void): this;
    prependListener(eventName: string, listener: (...args: unknown[]) => void): this;
    prependOnceListener(eventName: string, listener: (...args: unknown[]) => void): this;
    /**
     * When the provider becomes disconnected, updates internal state and emits
     * required events. Idempotent with respect to the isRecoverable parameter.
     *
     * Error codes per the CloseEvent status codes as required by EIP-1193:
     * https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes.
     *
     * @param isRecoverable - Whether the disconnection is recoverable.
     * @param errorMessage - A custom error message.
     * @fires BaseProvider#disconnect - If the disconnection is not recoverable.
     */
    protected _handleDisconnect(isRecoverable: boolean, errorMessage?: string): void;
    /**
     * Warns of deprecation for the given event, if applicable.
     *
     * @param eventName - The name of the event.
     */
    protected _warnOfDeprecation(eventName: string): void;
    /**
     * Equivalent to: `ethereum.request('eth_requestAccounts')`.
     *
     * @deprecated Use request({ method: 'eth_requestAccounts' }) instead.
     * @returns A promise that resolves to an array of addresses.
     */
    enable(): Promise<string[]>;
    /**
     * Submits an RPC request for the given method, with the given params.
     *
     * @deprecated Use "request" instead.
     * @param method - The method to request.
     * @param params - Any params for the method.
     * @returns A Promise that resolves with the JSON-RPC response object for the
     * request.
     */
    send<Type extends Json>(method: string, params?: Type[]): Promise<JsonRpcResponse<Type>>;
    /**
     * Submits an RPC request per the given JSON-RPC request object.
     *
     * @deprecated Use "request" instead.
     * @param payload - A JSON-RPC request object.
     * @param callback - An error-first callback that will receive the JSON-RPC
     * response object.
     */
    send<Type extends Json>(payload: JsonRpcRequest, callback: (error: Error | null, result?: JsonRpcResponse<Type>) => void): void;
    /**
     * Accepts a JSON-RPC request object, and synchronously returns the cached result
     * for the given method. Only supports 4 specific RPC methods.
     *
     * @deprecated Use "request" instead.
     * @param payload - A JSON-RPC request object.
     * @returns A JSON-RPC response object.
     */
    send<Type extends Json>(payload: SendSyncJsonRpcRequest): JsonRpcResponse<Type>;
    /**
     * Internal backwards compatibility method, used in send.
     *
     * @param payload - A JSON-RPC request object.
     * @returns A JSON-RPC response object.
     * @deprecated
     */
    protected _sendSync(payload: SendSyncJsonRpcRequest): {
        id: string | number | null;
        jsonrpc: "2.0";
        result: string | boolean | string[] | null;
    };
    /**
     * Constructor helper.
     *
     * Gets the experimental _metamask API as Proxy, so that we can warn consumers
     * about its experimental nature.
     *
     * @returns The experimental _metamask API.
     */
    protected _getExperimentalApi(): {
        /**
         * Determines if MetaMask is unlocked by the user.
         *
         * @returns Promise resolving to true if MetaMask is currently unlocked.
         */
        isUnlocked: () => Promise<boolean>;
        /**
         * Make a batch RPC request.
         *
         * @param requests - The RPC requests to make.
         */
        requestBatch: (requests: UnvalidatedJsonRpcRequest[]) => Promise<unknown>;
    };
    /**
     * Upon receipt of a new chainId and networkVersion, emits corresponding
     * events and sets relevant public state. Does nothing if neither the chainId
     * nor the networkVersion are different from existing values.
     *
     * @fires MetamaskInpageProvider#networkChanged
     * @param networkInfo - An object with network info.
     * @param networkInfo.chainId - The latest chain ID.
     * @param networkInfo.networkVersion - The latest network ID.
     */
    protected _handleChainChanged({ chainId, networkVersion, }?: {
        chainId?: string;
        networkVersion?: string;
    }): void;
}
export {};
//# sourceMappingURL=MetaMaskInpageProvider.d.ts.map