import { EventEmitter2 } from 'eventemitter2';
import { ECIESProps } from './ECIES';
import { SocketService } from './SocketService';
import { AutoConnectOptions } from './types/AutoConnectOptions';
import { ChannelConfig } from './types/ChannelConfig';
import { CommunicationLayerMessage } from './types/CommunicationLayerMessage';
import { CommunicationLayerPreference } from './types/CommunicationLayerPreference';
import { ConnectionStatus } from './types/ConnectionStatus';
import { DappMetadataWithSource } from './types/DappMetadata';
import { DisconnectOptions } from './types/DisconnectOptions';
import { CommunicationLayerLoggingOptions } from './types/LoggingOptions';
import { OriginatorInfo } from './types/OriginatorInfo';
import { PlatformType } from './types/PlatformType';
import { ServiceStatus } from './types/ServiceStatus';
import { StorageManager as SessionStorageManager, StorageManagerProps } from './types/StorageManager';
import { WalletInfo } from './types/WalletInfo';
type MetaMaskMobile = 'metamask-mobile';
export interface RemoteCommunicationProps {
    platformType: PlatformType | MetaMaskMobile;
    communicationLayerPreference: CommunicationLayerPreference;
    otherPublicKey?: string;
    protocolVersion?: number;
    privateKey?: string;
    reconnect?: boolean;
    relayPersistence?: boolean;
    dappMetadata?: DappMetadataWithSource;
    walletInfo?: WalletInfo;
    transports?: string[];
    analytics?: boolean;
    communicationServerUrl?: string;
    ecies?: ECIESProps;
    sdkVersion?: string;
    storage?: StorageManagerProps;
    context: string;
    autoConnect?: AutoConnectOptions;
    logging?: CommunicationLayerLoggingOptions;
}
export interface RemoteCommunicationState {
    ready: boolean;
    authorized: boolean;
    isOriginator: boolean;
    paused: boolean;
    relayPersistence?: boolean;
    otherPublicKey?: string;
    protocolVersion: number;
    privateKey?: string;
    terminated: boolean;
    transports?: string[];
    platformType: PlatformType | MetaMaskMobile;
    analytics: boolean;
    channelId?: string;
    channelConfig?: ChannelConfig;
    walletInfo?: WalletInfo;
    persist?: boolean;
    communicationLayer?: SocketService;
    originatorInfo?: OriginatorInfo;
    originatorInfoSent: boolean;
    reconnection: boolean;
    dappMetadata?: DappMetadataWithSource;
    communicationServerUrl: string;
    context: string;
    storageManager?: SessionStorageManager;
    storageOptions?: StorageManagerProps;
    sdkVersion?: string;
    autoConnectOptions?: AutoConnectOptions;
    clientsConnected: boolean;
    sessionDuration: number;
    originatorConnectStarted: boolean;
    debug: boolean;
    logging?: CommunicationLayerLoggingOptions;
    _connectionStatus: ConnectionStatus;
}
export declare class RemoteCommunication extends EventEmitter2 {
    state: RemoteCommunicationState;
    constructor({ platformType, communicationLayerPreference, otherPublicKey, reconnect, walletInfo, dappMetadata, protocolVersion, transports, context, relayPersistence, ecies, analytics, storage, sdkVersion, communicationServerUrl, logging, autoConnect, }: RemoteCommunicationProps);
    private initCommunicationLayer;
    /**
     * Connect from the dapp using session persistence.
     */
    originatorSessionConnect(): Promise<ChannelConfig | undefined>;
    generateChannelIdConnect(): Promise<{
        channelId: string;
        pubKey: string;
    }>;
    clean(): void;
    connectToChannel({ channelId, withKeyExchange, }: {
        channelId: string;
        withKeyExchange?: boolean;
    }): void;
    sendMessage(message: CommunicationLayerMessage): Promise<void>;
    testStorage(): Promise<void>;
    getChannelConfig(): ChannelConfig | undefined;
    /**
     * Check if the connection is ready to handle secure communication.
     *
     * @returns boolean
     */
    isReady(): boolean;
    /**
     * Check the value of the socket io client.
     *
     * @returns boolean
     */
    isConnected(): boolean | undefined;
    isAuthorized(): boolean;
    isPaused(): boolean;
    getCommunicationLayer(): SocketService | undefined;
    ping(): void;
    testLogger(): void;
    keyCheck(): void;
    setConnectionStatus(connectionStatus: ConnectionStatus): void;
    emitServiceStatusEvent(_?: {
        context?: string;
    }): void;
    getConnectionStatus(): ConnectionStatus;
    getServiceStatus(): ServiceStatus;
    getKeyInfo(): import(".").KeyInfo | undefined;
    resetKeys(): void;
    setOtherPublicKey(otherPublicKey: string): void;
    pause(): void;
    getVersion(): string;
    hasRelayPersistence(): boolean;
    resume(): void;
    getChannelId(): string | undefined;
    getRPCMethodTracker(): import("./SocketService").RPCMethodCache | undefined;
    disconnect(options?: DisconnectOptions): void;
}
export {};
//# sourceMappingURL=RemoteCommunication.d.ts.map