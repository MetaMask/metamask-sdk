import { Duplex } from 'readable-stream';
import { MetaMaskInpageProvider } from '@metamask/providers';
export interface SDKProviderProps {
    /**
     * The stream used to connect to the wallet.
     */
    connectionStream: Duplex;
    /**
     * Automatically call eth_requestAccounts on initialization.
     */
    autoRequestAccounts?: boolean;
    /**
     * Whether the provider should be set as window.ethereum.
     */
    shouldSetOnWindow?: boolean;
    shouldSendMetadata?: boolean;
    /**
     * Whether the window.web3 shim should be set.
     */
    shouldShimWeb3?: boolean;
}
interface SDKProviderState {
    autoRequestAccounts: boolean;
    providerStateRequested: boolean;
    chainId: string;
    networkVersion?: string;
}
export declare class SDKProvider extends MetaMaskInpageProvider {
    state: SDKProviderState;
    constructor({ connectionStream, shouldSendMetadata, autoRequestAccounts, }: SDKProviderProps);
    forceInitializeState(): Promise<void>;
    _setConnected(): void;
    getState(): import("@metamask/providers/dist/types/BaseProvider").BaseProviderState;
    getSDKProviderState(): SDKProviderState;
    getSelectedAddress(): string | null;
    getChainId(): string;
    getNetworkVersion(): string | undefined;
    setSDKProviderState(state: Partial<SDKProviderState>): void;
    handleDisconnect({ terminate }: {
        terminate: boolean;
    }): void;
    protected _initializeStateAsync(): Promise<void>;
    protected _initializeState(initialState?: {
        accounts: string[];
        chainId: string;
        isUnlocked: boolean;
        networkVersion?: string | undefined;
    } | undefined): void;
    protected _handleChainChanged({ chainId, networkVersion, }?: {
        chainId?: string;
        networkVersion?: string;
    }): void;
}
export {};
//# sourceMappingURL=SDKProvider.d.ts.map