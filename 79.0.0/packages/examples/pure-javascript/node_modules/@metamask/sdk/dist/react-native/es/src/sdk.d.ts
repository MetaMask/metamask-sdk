import { MetaMaskInpageProvider } from '@metamask/providers';
import { CommunicationLayerPreference, DappMetadata, StorageManagerProps } from '@metamask/sdk-communication-layer';
import EventEmitter2 from 'eventemitter2';
import { i18n } from 'i18next';
import { MetaMaskInstaller } from './Platform/MetaMaskInstaller';
import { PlatformManager } from './Platform/PlatfformManager';
import { SDKProvider } from './provider/SDKProvider';
import { Analytics } from './services/Analytics';
import { RPC_URLS_MAP } from './services/MetaMaskSDK/InitializerManager/setupReadOnlyRPCProviders';
import { RemoteConnection, RemoteConnectionProps } from './services/RemoteConnection';
import { SDKLoggingOptions } from './types/SDKLoggingOptions';
import { SDKUIOptions } from './types/SDKUIOptions';
import { WakeLockStatus } from './types/WakeLockStatus';
export interface MetaMaskSDKOptions {
    /**
     * The Infura API key to use for RPC requests.
     */
    infuraAPIKey?: string;
    /**
     * A map of RPC URLs to use for read-only requests.
     */
    readonlyRPCMap?: RPC_URLS_MAP;
    /**
     * If true, the SDK will inject the provider into the global `window` object.
     */
    injectProvider?: boolean;
    /**
     * If true, the SDK will force inject the provider into the global `window` object.
     */
    forceInjectProvider?: boolean;
    /**
     * If true, the SDK will force delete the provider from the global `window` object.
     */
    forceDeleteProvider?: boolean;
    /**
     * If true, the SDK will check if MetaMask is installed on the user's browser and send a connection request. If not it will prompt the user to install it. If false, the SDK will wait for the connect method to be called to check if MetaMask is installed.
     */
    checkInstallationImmediately?: boolean;
    /**
     * If true, the SDK will check if MetaMask is installed on the user's browser before each RPC call. If not it will prompt the user to install it.
     */
    checkInstallationOnAllCalls?: boolean;
    /**
     * If true, the SDK will prefer the desktop version of MetaMask over the mobile version.
     */
    preferDesktop?: boolean;
    /**
     * A function that will be called to open a deeplink to the MetaMask Mobile app.
     */
    openDeeplink?: (arg: string) => void;
    /**
     * If true, the SDK will use deeplinks to connect with MetaMask Mobile. If false, the SDK will use universal links to connect with MetaMask Mobile.
     */
    useDeeplink?: boolean;
    /**
     * The type of wake lock to use when the SDK is running in the background.
     */
    wakeLockType?: WakeLockStatus;
    /**
     * If true, the SDK will shim the window.web3 object with the provider returned by the SDK (useful for compatibility with older browser).
     */
    shouldShimWeb3?: boolean;
    /**
     * The preferred communication layer to use for the SDK.
     */
    communicationLayerPreference?: CommunicationLayerPreference;
    /**
     * An array of transport protocols to use for communication with the MetaMask wallet.
     */
    transports?: string[];
    /**
     * Metadata about the dapp using the SDK.
     */
    dappMetadata: DappMetadata;
    /**
     * A timer object to use for scheduling tasks.
     */
    timer?: any;
    /**
     * Send anonymous analytics to MetaMask to help us improve the SDK.
     */
    enableAnalytics?: boolean;
    /**
     * If MetaMask browser extension is detected, directly use it.
     */
    extensionOnly?: boolean;
    /**
     * Options for customizing the SDK UI.
     */
    ui?: SDKUIOptions;
    /**
     * An object that allows you to customize or translate each of the displayed modals. See the nodejs example for more information.
     */
    modals?: RemoteConnectionProps['modals'];
    /**
     * The URL of the communication server to use for the SDK.
     */
    communicationServerUrl?: string;
    /**
     * Options for customizing the storage manager used by the SDK.
     */
    storage?: StorageManagerProps;
    /**
     * Options for customizing the logging behavior of the SDK.
     */
    logging?: SDKLoggingOptions;
    /**
     * A string to track external integrations (e.g. wagmi).
     */
    _source?: string;
    i18nOptions?: {
        debug?: boolean;
        enabled?: boolean;
    };
}
export declare class MetaMaskSDK extends EventEmitter2 {
    options: MetaMaskSDKOptions;
    activeProvider?: SDKProvider;
    sdkProvider?: SDKProvider;
    remoteConnection?: RemoteConnection;
    installer?: MetaMaskInstaller;
    platformManager?: PlatformManager;
    dappMetadata?: DappMetadata;
    extensionActive: boolean;
    extension: MetaMaskInpageProvider | undefined;
    _initialized: boolean;
    sdkInitPromise?: Promise<void> | undefined;
    debug: boolean;
    analytics?: Analytics;
    private readonlyRPCCalls;
    i18nInstance: i18n;
    availableLanguages: string[];
    constructor(options?: MetaMaskSDKOptions);
    init(): Promise<void | MetaMaskSDK>;
    isExtensionActive(): boolean;
    connect(): Promise<import("@metamask/providers/dist/types/utils").Maybe<unknown>>;
    connectAndSign({ msg }: {
        msg: string;
    }): Promise<import("@metamask/providers/dist/types/utils").Maybe<unknown>>;
    connectWith(rpc: {
        method: string;
        params: any[];
    }): Promise<import("@metamask/providers/dist/types/utils").Maybe<unknown>>;
    resume(): Promise<void>;
    /**
     * DEPRECATED: use terminate() instead.
     */
    disconnect(): Promise<void>;
    isAuthorized(): void;
    terminate(): Promise<void>;
    isInitialized(): boolean;
    setReadOnlyRPCCalls(allowed: boolean): void;
    hasReadOnlyRPCCalls(): boolean;
    getProvider(): SDKProvider | undefined;
    getMobileProvider(): SDKProvider;
    getUniversalLink(): string;
    getChannelId(): string | undefined;
    getRPCHistory(): import("@metamask/sdk-communication-layer").RPCMethodCache | undefined;
    getVersion(): string;
    getWalletStatus(): import("@metamask/sdk-communication-layer").ConnectionStatus | undefined;
    _getChannelConfig(): import("@metamask/sdk-communication-layer").ChannelConfig | undefined;
    _ping(): void;
    _keyCheck(): void;
    _getServiceStatus(): import("@metamask/sdk-communication-layer").ServiceStatus | undefined;
    _getRemoteConnection(): RemoteConnection | undefined;
    _getDappMetadata(): DappMetadata | undefined;
    _getKeyInfo(): import("@metamask/sdk-communication-layer").KeyInfo | undefined;
    _resetKeys(): void;
    _getConnection(): RemoteConnection | undefined;
}
//# sourceMappingURL=sdk.d.ts.map