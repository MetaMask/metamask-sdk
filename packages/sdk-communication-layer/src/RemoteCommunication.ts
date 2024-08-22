import debug from 'debug';
import { EventEmitter2 } from 'eventemitter2';
import packageJson from '../package.json';
import { ECIESProps } from './ECIES';
import { SocketService } from './SocketService';
import {
  CHANNEL_MAX_WAITING_TIME,
  DEFAULT_SERVER_URL,
  DEFAULT_SESSION_TIMEOUT_MS,
} from './config';
import {
  clean,
  generateChannelIdConnect,
} from './services/RemoteCommunication/ChannelManager';
import {
  connectToChannel,
  disconnect,
  initCommunicationLayer,
  originatorSessionConnect,
  resume,
} from './services/RemoteCommunication/ConnectionManager';
import { sendMessage } from './services/RemoteCommunication/MessageHandlers';
import { testStorage } from './services/RemoteCommunication/StorageManager';
import { AutoConnectOptions } from './types/AutoConnectOptions';
import { ChannelConfig } from './types/ChannelConfig';
import { CommunicationLayerMessage } from './types/CommunicationLayerMessage';
import { CommunicationLayerPreference } from './types/CommunicationLayerPreference';
import { ConnectionStatus } from './types/ConnectionStatus';
import { DappMetadataWithSource } from './types/DappMetadata';
import { DisconnectOptions } from './types/DisconnectOptions';
import { EventType } from './types/EventType';
import { CommunicationLayerLoggingOptions } from './types/LoggingOptions';
import { OriginatorInfo } from './types/OriginatorInfo';
import { PlatformType } from './types/PlatformType';
import { ServiceStatus } from './types/ServiceStatus';
import {
  StorageManager as SessionStorageManager,
  StorageManagerProps,
} from './types/StorageManager';
import { WalletInfo } from './types/WalletInfo';
import { logger } from './utils/logger';
import { Channel } from './types/Channel';

type MetaMaskMobile = 'metamask-mobile';

export interface RemoteCommunicationProps {
  platformType: PlatformType | MetaMaskMobile;
  communicationLayerPreference: CommunicationLayerPreference;
  otherPublicKey?: string;
  protocolVersion?: number;
  privateKey?: string;
  reconnect?: boolean;
  relayPersistence?: boolean; // Used by wallet to start the connection with relayPersistence and avoid the key exchange.
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
export class RemoteCommunication extends EventEmitter2 {
  public state: RemoteCommunicationState = {
    // ready flag is turned on after we receive 'clients_ready' message, meaning key exchange is complete.
    ready: false,
    // flag turned on once the connection has been authorized on the wallet.
    authorized: false,
    isOriginator: false,
    terminated: false,
    protocolVersion: 1,
    paused: false,
    platformType: 'metamask-mobile',
    analytics: false,
    reconnection: false,
    originatorInfoSent: false,
    communicationServerUrl: DEFAULT_SERVER_URL,
    context: '',
    persist: false,
    // Keep track if the other side is connected to the socket
    clientsConnected: false,
    sessionDuration: DEFAULT_SESSION_TIMEOUT_MS,
    // this flag is switched on when the connection is automatically initialized after finding existing channel configuration.
    originatorConnectStarted: false,
    debug: false,
    // Status of the other side of the connection
    // 1) if I am MetaMask then other is Dapp
    // 2) If I am Dapp (isOriginator==true) then other side is MetaMask
    // Should not be set directly, use this.setConnectionStatus() instead to always emit events.
    _connectionStatus: ConnectionStatus.DISCONNECTED,
  };

  constructor({
    platformType,
    communicationLayerPreference,
    otherPublicKey,
    reconnect,
    walletInfo,
    dappMetadata,
    protocolVersion,
    transports,
    context,
    relayPersistence,
    ecies,
    analytics = false,
    storage,
    sdkVersion,
    communicationServerUrl = DEFAULT_SERVER_URL,
    logging,
    autoConnect = {
      timeout: CHANNEL_MAX_WAITING_TIME,
    },
  }: RemoteCommunicationProps) {
    super();

    this.state.otherPublicKey = otherPublicKey;
    this.state.dappMetadata = dappMetadata;
    this.state.walletInfo = walletInfo;
    this.state.transports = transports;
    this.state.platformType = platformType;
    this.state.analytics = analytics;
    this.state.protocolVersion = protocolVersion ?? 1;
    this.state.isOriginator = !otherPublicKey;
    this.state.relayPersistence = relayPersistence;
    this.state.communicationServerUrl = communicationServerUrl;
    this.state.context = context;
    this.state.terminated = false;
    this.state.sdkVersion = sdkVersion;

    this.setMaxListeners(50);

    this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
    if (storage?.duration) {
      this.state.sessionDuration = DEFAULT_SESSION_TIMEOUT_MS;
    }
    this.state.storageOptions = storage;
    this.state.autoConnectOptions = autoConnect;
    this.state.debug = logging?.remoteLayer === true;

    // Enable loggers early
    if (logging?.remoteLayer === true) {
      debug.enable('RemoteCommunication:Layer');
    }

    if (logging?.serviceLayer === true) {
      debug.enable('SocketService:Layer');
    }

    if (logging?.eciesLayer === true) {
      debug.enable('ECIES:Layer');
    }

    if (logging?.keyExchangeLayer === true) {
      debug.enable('KeyExchange:Layer');
    }

    this.state.logging = logging;

    if (storage?.storageManager) {
      this.state.storageManager = storage.storageManager;
    }

    logger.RemoteCommunication(
      `[RemoteCommunication: constructor()] protocolVersion=${protocolVersion} relayPersistence=${relayPersistence} isOriginator=${this.state.isOriginator} communicationLayerPreference=${communicationLayerPreference} otherPublicKey=${otherPublicKey} reconnect=${reconnect}`,
    );

    this.initCommunicationLayer({
      communicationLayerPreference,
      otherPublicKey,
      reconnect,
      ecies,
      communicationServerUrl,
    });

    this.emitServiceStatusEvent({ context: 'constructor' });
  }

  private initCommunicationLayer({
    communicationLayerPreference,
    otherPublicKey,
    reconnect,
    ecies,
    communicationServerUrl = DEFAULT_SERVER_URL,
  }: Pick<
    RemoteCommunicationProps,
    | 'communicationLayerPreference'
    | 'otherPublicKey'
    | 'reconnect'
    | 'ecies'
    | 'communicationServerUrl'
  >) {
    return initCommunicationLayer({
      communicationLayerPreference,
      otherPublicKey,
      reconnect,
      ecies,
      communicationServerUrl,
      instance: this,
    });
  }

  /**
   * Initialize the connection from the dapp side.
   */
  public async initFromDappStorage() {
    if (this.state.storageManager) {
      // Try to get existing channel config from storage
      const channelConfig =
        await this.state.storageManager.getPersistedChannelConfig({});
      if (channelConfig) {
        this.state.channelConfig = channelConfig;
        this.state.channelId = channelConfig.channelId;
        if (channelConfig.relayPersistence) {
          this.state.authorized = true;
          this.state.ready = true;
          this.setConnectionStatus(ConnectionStatus.LINKED);
          await this.connectToChannel({
            channelId: channelConfig.channelId,
          });
        }
      }
    }
  }

  /**
   * Connect from the dapp using session persistence.
   */
  async originatorSessionConnect(): Promise<ChannelConfig | undefined> {
    const channelConfig = await originatorSessionConnect(this);
    return channelConfig;
  }

  async generateChannelIdConnect(): Promise<Channel> {
    return generateChannelIdConnect(this.state);
  }

  clean() {
    return clean(this.state);
  }

  connectToChannel({
    channelId,
    withKeyExchange,
    authorized,
  }: {
    channelId: string;
    authorized?: boolean;
    withKeyExchange?: boolean;
  }): Promise<void> {
    return connectToChannel({
      channelId,
      authorized,
      withKeyExchange,
      state: this.state,
    });
  }

  sendMessage(message: CommunicationLayerMessage): Promise<void> {
    return sendMessage(this, message);
  }

  async testStorage() {
    return testStorage(this.state);
  }

  getChannelConfig() {
    return this.state.channelConfig;
  }

  /**
   * Check if the connection is ready to handle secure communication.
   *
   * @returns boolean
   */
  isReady() {
    return this.state.ready;
  }

  /**
   * Check the value of the socket io client.
   *
   * @returns boolean
   */
  isConnected() {
    return this.state.communicationLayer?.isConnected();
  }

  isAuthorized() {
    return this.state.authorized;
  }

  isPaused() {
    return this.state.paused;
  }

  getCommunicationLayer() {
    return this.state.communicationLayer;
  }

  ping() {
    logger.RemoteCommunication(
      `[RemoteCommunication: ping()] channel=${this.state.channelId}`,
    );

    this.state.communicationLayer?.ping();
  }

  testLogger() {
    logger.RemoteCommunication(`testLogger() channel=${this.state.channelId}`);
    logger.SocketService(`testLogger() channel=${this.state.channelId}`);
    logger.Ecies(`testLogger() channel=${this.state.channelId}`);
    logger.KeyExchange(`testLogger() channel=${this.state.channelId}`);
  }

  keyCheck() {
    logger.RemoteCommunication(
      `[RemoteCommunication: keyCheck()] channel=${this.state.channelId}`,
    );

    this.state.communicationLayer?.keyCheck();
  }

  setConnectionStatus(connectionStatus: ConnectionStatus) {
    if (this.state._connectionStatus === connectionStatus) {
      return; // Don't re-emit current status.
    }
    this.state._connectionStatus = connectionStatus;
    this.emit(EventType.CONNECTION_STATUS, connectionStatus);
    this.emitServiceStatusEvent({ context: 'setConnectionStatus' });
  }

  emitServiceStatusEvent(_: { context?: string } = {}) {
    // only emit if there was a change in the service status
    this.emit(EventType.SERVICE_STATUS, this.getServiceStatus());
  }

  getConnectionStatus() {
    return this.state._connectionStatus;
  }

  getServiceStatus(): ServiceStatus {
    return {
      originatorInfo: this.state.originatorInfo,
      keyInfo: this.getKeyInfo(),
      connectionStatus: this.state._connectionStatus,
      channelConfig: this.state.channelConfig,
      channelId: this.state.channelId,
    };
  }

  getKeyInfo() {
    return this.state.communicationLayer?.getKeyInfo();
  }

  resetKeys() {
    this.state.communicationLayer?.resetKeys();
  }

  setOtherPublicKey(otherPublicKey: string) {
    const keyExchange = this.state.communicationLayer?.getKeyExchange();
    if (!keyExchange) {
      throw new Error('KeyExchange is not initialized.');
    }

    if (keyExchange.getOtherPublicKey() !== otherPublicKey) {
      keyExchange.setOtherPublicKey(otherPublicKey);
    }
  }

  pause() {
    logger.RemoteCommunication(
      `[RemoteCommunication: pause()] channel=${this.state.channelId}`,
    );

    this.state.communicationLayer?.pause();
    this.setConnectionStatus(ConnectionStatus.PAUSED);
  }

  getVersion() {
    return packageJson.version;
  }

  hasRelayPersistence() {
    return this.state.relayPersistence ?? false;
  }

  resume() {
    return resume(this);
  }

  encrypt(data: string) {
    const keyExchange = this.state.communicationLayer?.getKeyExchange();
    const otherPublicKey = keyExchange?.getOtherPublicKey();
    if (!otherPublicKey) {
      throw new Error('KeyExchange not completed');
    }
    return this.state.communicationLayer?.state.eciesInstance?.encrypt(
      data,
      otherPublicKey,
    );
  }

  decrypt(data: string) {
    if (!this.state.communicationLayer?.state.eciesInstance) {
      throw new Error('ECIES instance is not initialized');
    }
    return this.state.communicationLayer?.state.eciesInstance?.decrypt(data);
  }

  getChannelId() {
    return this.state.channelId;
  }

  getRPCMethodTracker() {
    return this.state.communicationLayer?.getRPCMethodTracker();
  }

  disconnect(options?: DisconnectOptions) {
    return disconnect({
      options,
      instance: this,
    });
  }
}
