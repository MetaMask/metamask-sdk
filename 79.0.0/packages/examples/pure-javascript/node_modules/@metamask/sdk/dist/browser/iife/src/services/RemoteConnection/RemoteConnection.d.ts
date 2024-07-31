import { ChannelConfig, CommunicationLayerPreference, DappMetadata, DisconnectOptions, ECIESProps, KeyInfo, RemoteCommunication, StorageManagerProps } from '@metamask/sdk-communication-layer';
import { i18n } from 'i18next';
import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';
import { PlatformManager } from '../../Platform/PlatfformManager';
import { MetaMaskSDK } from '../../sdk';
import { SDKLoggingOptions } from '../../types/SDKLoggingOptions';
import { Analytics } from '../Analytics';
import { ProviderService } from '../ProviderService';
import { StartConnectionExtras } from './ConnectionManager';
export interface RemoteConnectionProps {
    timer?: {
        runBackgroundTimer?: (cb: () => void, ms: number) => number;
        stopBackgroundTimer?: () => void;
    };
    communicationLayerPreference: CommunicationLayerPreference;
    dappMetadata?: DappMetadata;
    _source?: string;
    enableAnalytics?: boolean;
    analytics: Analytics;
    sdk: MetaMaskSDK;
    transports?: string[];
    platformManager: PlatformManager;
    communicationServerUrl?: string;
    ecies?: ECIESProps;
    storage?: StorageManagerProps;
    logging?: SDKLoggingOptions;
    preferDesktop?: boolean;
    i18nInstance: i18n;
    getMetaMaskInstaller: () => MetaMaskInstaller;
    connectWithExtensionProvider?: () => void;
    modals: {
        onPendingModalDisconnect?: () => void;
        install?: (params: {
            i18nInstance: i18n;
            link: string;
            debug?: boolean;
            preferDesktop?: boolean;
            installer: MetaMaskInstaller;
            terminate?: () => void;
            connectWithExtension?: () => void;
        }) => {
            unmount?: (shouldTerminate?: boolean) => void;
            mount?: (link: string) => void;
        };
        otp?: ({ i18nInstance, debug, onDisconnect, }: {
            i18nInstance: i18n;
            debug?: boolean;
            onDisconnect?: () => void;
        }) => {
            mount?: () => void;
            updateOTPValue?: (otpValue: string) => void;
            unmount?: () => void;
        };
    };
}
export interface RemoteConnectionState {
    connector?: RemoteCommunication;
    qrcodeLink?: string;
    useDeeplink?: boolean;
    developerMode: boolean;
    analytics?: Analytics;
    authorized: boolean;
    reconnection: boolean;
    preferDesktop?: boolean;
    communicationLayerPreference?: CommunicationLayerPreference;
    platformManager?: PlatformManager;
    pendingModal?: {
        mount?: (props?: {
            displayOTP?: boolean;
        }) => void;
        updateOTPValue?: (otpValue: string) => void;
        unmount?: () => void;
    };
    installModal?: {
        unmount?: (shouldTerminate: boolean) => void;
        mount?: (link: string) => void;
    };
    /**
     * Wait for value from metamask mobile
     */
    otpAnswer?: string;
}
export declare class RemoteConnection implements ProviderService {
    private options;
    state: RemoteConnectionState;
    constructor(options: RemoteConnectionProps);
    /**
     * This will start the installer or pending modal and resolve once it is displayed.
     * It doesn't wait for the actual connection to be authorized.
     */
    startConnection(extras?: StartConnectionExtras): Promise<void>;
    showActiveModal(): void;
    getUniversalLink(): string;
    getChannelConfig(): ChannelConfig | undefined;
    getKeyInfo(): KeyInfo | undefined;
    getConnector(): RemoteCommunication;
    getPlatformManager(): PlatformManager;
    isConnected(): boolean;
    isAuthorized(): boolean;
    isPaused(): boolean | undefined;
    disconnect(options?: DisconnectOptions): void;
}
//# sourceMappingURL=RemoteConnection.d.ts.map