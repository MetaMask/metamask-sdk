/* eslint-disable import/prefer-default-export */
import { EventEmitter2 } from 'eventemitter2';
import { validate } from 'uuid';
import { SendAnalytics } from './Analytics';
import {
  CHANNEL_MAX_WAITING_TIME,
  DEFAULT_SERVER_URL,
  DEFAULT_SESSION_TIMEOUT_MS,
  VERSION,
} from './config';
import { ECIESProps } from './ECIES';
import { SocketService } from './SocketService';
import { StorageManager, StorageManagerProps } from './types/StorageManager';
import { AutoConnectOptions } from './types/AutoConnectOptions';
import { ChannelConfig } from './types/ChannelConfig';
import { CommunicationLayer } from './types/CommunicationLayer';
import { CommunicationLayerMessage } from './types/CommunicationLayerMessage';
import { CommunicationLayerPreference } from './types/CommunicationLayerPreference';
import { ConnectionStatus } from './types/ConnectionStatus';
import { DappMetadata } from './types/DappMetadata';
import { DisconnectOptions } from './types/DisconnectOptions';
import { MessageType } from './types/MessageType';
import { OriginatorInfo } from './types/OriginatorInfo';
import { TrackingEvents } from './types/TrackingEvent';
import { WalletInfo } from './types/WalletInfo';
import { WebRTCLib } from './types/WebRTCLib';
import { WebRTCService } from './WebRTCService';
import { ServiceStatus } from './types/ServiceStatus';

export interface RemoteCommunicationProps {
  platform: string;
  communicationLayerPreference: CommunicationLayerPreference;
  otherPublicKey?: string;
  webRTCLib?: WebRTCLib;
  reconnect?: boolean;
  dappMetadata?: DappMetadata;
  transports?: string[];
  analytics?: boolean;
  communicationServerUrl?: string;
  ecies?: ECIESProps;
  storage?: StorageManagerProps;
  context: string;
  autoConnect?: AutoConnectOptions;
  developerMode?: boolean;
}

export class RemoteCommunication extends EventEmitter2 {
  private connected = false;

  private isOriginator = false;

  private paused = false;

  private otherPublicKey?: string;

  private webRTCLib?: WebRTCLib;

  private transports?: string[];

  private platform: string;

  private analytics = false;

  private developerMode = false;

  private channelId?: string;

  private channelConfig?: ChannelConfig;

  private walletInfo?: WalletInfo;

  private communicationLayer?: CommunicationLayer;

  private originatorInfo?: OriginatorInfo;

  private dappMetadata?: DappMetadata;

  private communicationServerUrl: string;

  private context: string;

  private storageManager?: StorageManager;

  private storageOptions?: StorageManagerProps;

  private autoConnectOptions;

  // this flag is switched on when the connection is automatically initialized after finding existing channel configuration.
  private autoStarted = false;

  // Status of the other side of the connection
  // 1) if I am MetaMask then other is Dapp
  // 2) If I am Dapp (isOriginator==true) then other side is MetaMask
  // Should not be set directly, use this.setConnectionStatus() instead to always emit events.
  private _connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;

  constructor({
    platform,
    communicationLayerPreference,
    otherPublicKey,
    webRTCLib,
    reconnect,
    dappMetadata,
    transports,
    context,
    ecies,
    analytics = false,
    storage,
    communicationServerUrl = DEFAULT_SERVER_URL,
    developerMode = false,
    autoConnect = {
      timeout: CHANNEL_MAX_WAITING_TIME,
    },
  }: RemoteCommunicationProps) {
    super();

    this.otherPublicKey = otherPublicKey;
    this.webRTCLib = webRTCLib;
    this.dappMetadata = dappMetadata;
    this.transports = transports;
    this.platform = platform;
    this.analytics = analytics;
    this.communicationServerUrl = communicationServerUrl;
    this.context = context;
    this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
    this.storageOptions = storage;
    this.autoConnectOptions = autoConnect;
    this.developerMode = developerMode;
    if (storage?.storageManager) {
      this.storageManager = storage.storageManager;
    }

    this.initCommunicationLayer({
      communicationLayerPreference,
      otherPublicKey,
      webRTCLib,
      reconnect,
      ecies,
      communicationServerUrl,
    });

    this.emitServiceStatusEvent();
  }

  private initCommunicationLayer({
    communicationLayerPreference,
    otherPublicKey,
    webRTCLib,
    reconnect,
    ecies,
    communicationServerUrl = DEFAULT_SERVER_URL,
  }: Pick<
    RemoteCommunicationProps,
    | 'communicationLayerPreference'
    | 'otherPublicKey'
    | 'webRTCLib'
    | 'reconnect'
    | 'ecies'
    | 'communicationServerUrl'
  >) {
    switch (communicationLayerPreference) {
      case CommunicationLayerPreference.WEBRTC:
        this.communicationLayer = new WebRTCService({
          communicationLayerPreference,
          otherPublicKey,
          reconnect,
          transports: this.transports,
          webRTCLib,
          communicationServerUrl,
          ecies,
          context: this.context,
          debug: this.developerMode,
        });
        break;
      case CommunicationLayerPreference.SOCKET:
        this.communicationLayer = new SocketService({
          communicationLayerPreference,
          otherPublicKey,
          reconnect,
          transports: this.transports,
          communicationServerUrl,
          context: this.context,
          ecies,
          debug: this.developerMode,
        });
        break;
      default:
        throw new Error('Invalid communication protocol');
    }

    let url =
      (typeof document !== 'undefined' && document.URL) || 'url undefined';
    let title =
      (typeof document !== 'undefined' && document.title) || 'title undefined';

    if (this.dappMetadata?.url) {
      url = this.dappMetadata.url;
    }

    if (this.dappMetadata?.name) {
      title = this.dappMetadata.name;
    }

    const originatorInfo: OriginatorInfo = {
      url,
      title,
      platform: this.platform,
    };

    this.communicationLayer?.on(
      MessageType.MESSAGE,
      (_message: CommunicationLayerMessage) => {
        let message = _message;
        // check if message is encapsulated for backward compatibility
        if (_message.message) {
          message = message.message as CommunicationLayerMessage;
        }
        this.onCommunicationLayerMessage(message);
      },
    );

    this.communicationLayer?.on(MessageType.KEY_INFO, (keyInfo) => {
      if (this.developerMode) {
        console.debug(
          `[communication][${this.context}] received 'KEY_INFO' `,
          keyInfo,
        );
      }
      this.emitServiceStatusEvent();
    });

    this.communicationLayer?.on(MessageType.CLIENTS_READY, (message) => {
      if (this.developerMode) {
        console.debug(
          `[communication][${this.context}] received 'clients_ready' `,
          message,
        );
      }

      this.setConnectionStatus(ConnectionStatus.LINKED);

      if (this.analytics && this.channelId) {
        SendAnalytics({
          id: this.channelId,
          event: TrackingEvents.CONNECTED,
        });
      }

      this.connected = true;
      this.emit(MessageType.CLIENTS_READY);

      if (!message.isOriginator) {
        return;
      }

      this.isOriginator = message.isOriginator;

      this.communicationLayer?.sendMessage({
        type: MessageType.ORIGINATOR_INFO,
        originatorInfo,
      });
    });

    this.communicationLayer?.on(
      MessageType.CLIENTS_DISCONNECTED,
      (channelId: string) => {
        if (this.developerMode) {
          console.debug(
            `RemoteCommunication::${this.context}]::on 'clients_disconnected' channelId=${channelId}`,
          );
        }

        // Then pause or cleanup the listeners.
        if (this.paused) {
          if (this.developerMode) {
            console.debug(
              `RemoteCommunication::${this.context}]::on 'clients_disconnected' connection paused - do nothing`,
            );
          }
          return;
        }

        // if MM disconnected without pause -- an error occured and we need to re-initialize the state
        // if Dapp disconnected without pause -- ok
        if (!this.isOriginator) {
          // if I am on metamask -- force pause it
          // reset encryption status to re-initialize key exchange
          this.paused = true;
          return;
        }

        if (this.analytics && this.channelId) {
          SendAnalytics({
            id: this.channelId,
            event: TrackingEvents.DISCONNECTED,
          });
        }

        this.clean();
        this.communicationLayer?.removeAllListeners();

        // Bubble up the disconnect event otherwise it would be missed.
        this.emit(MessageType.CLIENTS_DISCONNECTED, this.channelId);
        this.setConnectionStatus(ConnectionStatus.WAITING);
      },
    );

    this.communicationLayer?.on(MessageType.CHANNEL_CREATED, (id) => {
      if (this.developerMode) {
        console.debug(
          `RemoteCommunication::${this.context}::on 'channel_created' channelId=${id}`,
        );
      }
      this.emit(MessageType.CHANNEL_CREATED, id);
    });

    this.communicationLayer?.on(MessageType.CLIENTS_WAITING, (numberUsers) => {
      if (this.developerMode) {
        console.debug(
          `RemoteCommunication::${this.context}::on 'clients_waiting' numberUsers=${numberUsers}`,
        );
      }

      this.setConnectionStatus(ConnectionStatus.WAITING);

      if (this.analytics) {
        SendAnalytics({
          id: this.channelId ?? '',
          event: TrackingEvents.REQUEST,
          ...originatorInfo,
          communicationLayerPreference,
          sdkVersion: VERSION,
        });
      }

      if (this.autoStarted) {
        if (this.developerMode) {
          console.debug(
            `RemoteCommunication::on 'clients_waiting' watch autoStarted=${this.autoStarted} timeout`,
            this.autoConnectOptions,
          );
        }
        const timeoutId = setTimeout(() => {
          if (this.developerMode) {
            console.debug(
              `RemoteCommunication::on setTimeout(${this.autoConnectOptions.timeout}) terminate channelConfig`,
              this.autoConnectOptions,
            );
          }
          // Cleanup previous channelId
          // this.storageManager?.terminate();
          this.autoStarted = false;
          this.setConnectionStatus(ConnectionStatus.TIMEOUT);
          clearTimeout(timeoutId);
        }, this.autoConnectOptions.timeout);
      }

      this.emit(MessageType.CLIENTS_WAITING, numberUsers);
    });
  }

  private onCommunicationLayerMessage(message: CommunicationLayerMessage) {
    if (this.developerMode) {
      console.debug(
        `RemoteCommunication::${
          this.context
        }::onCommunicationLayerMessage typeof=${typeof message}`,
        message,
      );
    }

    if (message.type === MessageType.ORIGINATOR_INFO) {
      // TODO why these hardcoded value?
      this.communicationLayer?.sendMessage({
        type: MessageType.WALLET_INFO,
        walletInfo: {
          type: 'MetaMask',
          version: 'MetaMask/Mobile',
        },
      });
      this.originatorInfo = message.originatorInfo;
      this.connected = true;
      this.emit(MessageType.CLIENTS_READY, {
        isOriginator: this.isOriginator,
        originatorInfo: message.originatorInfo,
      });
      this.paused = false;
      return;
    } else if (message.type === MessageType.WALLET_INFO) {
      this.walletInfo = message.walletInfo;
      this.connected = true;
      this.emit(MessageType.CLIENTS_READY, {
        isOriginator: this.isOriginator,
        walletInfo: message.walletInfo,
      });
      this.paused = false;
      return;
    } else if (message.type === MessageType.TERMINATE) {
      // Needs to manually emit CLIENTS_DISCONNECTED because it won't receive it after the socket is closed.
      this.emit(MessageType.CLIENTS_DISCONNECTED);
      // remove channel config from persistence layer and close active connections.
      this.storageManager?.terminate();
      this.disconnect();
      // Reset keyexchange
      this.communicationLayer?.resetKeys();
      this.setConnectionStatus(ConnectionStatus.TERMINATED);
    } else if (message.type === MessageType.PAUSE) {
      this.paused = true;
      this.setConnectionStatus(ConnectionStatus.PAUSED);
    } else if (message.type === MessageType.READY) {
      if (this.paused) {
        // restarting from pause
        this.setConnectionStatus(ConnectionStatus.LINKED);
      }
      this.paused = false;
      this.emit(MessageType.CLIENTS_READY, {
        isOriginator: this.isOriginator,
        walletInfo: this.walletInfo,
      });
    }

    // Only emit JSON-RPC message
    this.emit(MessageType.MESSAGE, message);
  }

  async startAutoConnect(): Promise<ChannelConfig | undefined> {
    if (!this.storageManager) {
      if (this.developerMode) {
        console.debug(
          `RemoteCommunication::startAutoConnect() no storage manager defined - skip`,
        );
      }
      return undefined;
    }

    const channelConfig = await this.storageManager.getPersistedChannelConfig();
    if (this.developerMode) {
      console.debug(
        `RemoteCommunication::startAutoConnect() autoStarted=${this.autoStarted} channelConfig`,
        channelConfig,
      );
    }

    if (this.autoStarted) {
      // Prevent infinite loop by checking if it was already autoStarted.
      if (this.developerMode) {
        console.debug(
          `RemoteCommunication::startAutoConnect() already autoStarted - exit autoConnect()`,
        );
      }
      return undefined;
    }

    // is socket already connected?
    const connected = this.communicationLayer?.isConnected();
    if (connected) {
      if (this.developerMode) {
        console.debug(
          `RemoteCommunication::startAutoConnect() socket already connected - exit autoConnect()`,
        );
      }
      return undefined;
    }

    if (channelConfig) {
      const validSession = channelConfig.validUntil > Date.now();

      if (validSession) {
        this.channelConfig = channelConfig;
        this.autoStarted = true;
        this.communicationLayer?.connectToChannel({
          channelId: channelConfig.channelId,
          isOriginator: true,
        });
        return Promise.resolve(channelConfig);
      } else if (this.developerMode) {
        console.log(`RemoteCommunication::autoConnect Session has expired`);
      }
    } else if (this.developerMode) {
      console.debug(`RemoteCommunication::autoConnect not available`);
    }
    this.autoStarted = false;
    return undefined;
  }

  async generateChannelId() {
    if (!this.communicationLayer) {
      throw new Error('communication layer not initialized');
    }

    if (this.connected) {
      throw new Error('Channel already connected');
    }

    if (this.developerMode) {
      console.debug(`RemoteCommunication::generateChannelId()`);
    }

    this.clean();
    const channel = this.communicationLayer.createChannel();

    const channelConfig = {
      channelId: channel.channelId,
      validUntil: Date.now() + DEFAULT_SESSION_TIMEOUT_MS,
    };
    this.channelConfig = channelConfig;
    // save current channel config
    this.storageManager?.persistChannelConfig(channelConfig);

    this.channelId = channel.channelId;

    return { channelId: this.channelId, pubKey: channel.pubKey };
  }

  clean() {
    if (this.developerMode) {
      console.debug(`RemoteCommunication::${this.context}::clean()`);
    }

    this.channelId = undefined;
    this.connected = false;
    this.autoStarted = false;
  }

  connectToChannel(channelId: string) {
    if (!validate(channelId)) {
      throw new Error(`Invalid channel ${channelId}`);
    }

    if (this.developerMode) {
      console.debug(
        `RemoteCommunication::${this.context}::connectToChannel() channelId=${channelId}`,
      );
    }
    this.channelId = channelId;
    this.communicationLayer?.connectToChannel({ channelId });
  }

  sendMessage(message: CommunicationLayerMessage) {
    if (this.developerMode) {
      console.log(`RemoteCommunication::${this.context}::sendMessage`, message);
    }

    if (this.paused) {
      this.once(MessageType.CLIENTS_READY, () => {
        this.communicationLayer?.sendMessage(message);
      });
    } else {
      this.communicationLayer?.sendMessage(message);
    }
  }

  async testStorage() {
    const res = await this.storageManager?.getPersistedChannelConfig();
    console.debug(`RemoteCommunication.testStorage() res`, res);
  }

  getChannelConfig() {
    return this.channelConfig;
  }

  isConnected() {
    return this.connected;
  }

  isPaused() {
    return this.paused;
  }

  private setConnectionStatus(connectionStatus: ConnectionStatus) {
    if (this.developerMode) {
      console.debug(
        `RemoteCommunication::setConnectionStatus `,
        connectionStatus,
      );
    }
    this._connectionStatus = connectionStatus;
    this.emit(MessageType.CONNECTION_STATUS, connectionStatus);
    this.emitServiceStatusEvent();
  }

  private emitServiceStatusEvent() {
    this.emit(MessageType.SERVICE_STATUS, this.getServiceStatus());
  }

  getConnectionStatus() {
    return this._connectionStatus;
  }

  getServiceStatus(): ServiceStatus {
    return {
      originatorInfo: this.originatorInfo,
      keyInfo: this.getKeyInfo(),
      connectionStatus: this._connectionStatus,
      channelConfig: this.channelConfig,
      channelId: this.channelId,
    };
  }

  getKeyInfo() {
    return this.communicationLayer?.getKeyInfo();
  }

  pause() {
    if (this.developerMode) {
      console.debug(`RemoteCommunication::pause() `);
    }
    this.communicationLayer?.pause();
    this.setConnectionStatus(ConnectionStatus.PAUSED);
  }

  resume() {
    if (this.developerMode) {
      console.debug(`RemoteCommunication::resume() `);
    }
    this.communicationLayer?.resume();
    this.setConnectionStatus(ConnectionStatus.LINKED);
  }

  disconnect(options?: DisconnectOptions) {
    if (this.developerMode) {
      console.debug(`RemoteCommunication::disconnect() `);
    }

    if (options?.terminate) {
      this.setConnectionStatus(ConnectionStatus.TERMINATED);
      // remove channel config from persistence layer and close active connections.
      this.storageManager?.terminate();
    } else {
      this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
    }

    this.connected = false;
    this.communicationLayer?.disconnect(options);
  }
}
