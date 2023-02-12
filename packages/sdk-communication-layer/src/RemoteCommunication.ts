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
import { CommunicationLayerLoggingOptions } from './types/LogggingOptions';
import { EventType } from './types/EventType';

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
  logging?: CommunicationLayerLoggingOptions;
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

  private sessionDuration: number = DEFAULT_SESSION_TIMEOUT_MS;

  // this flag is switched on when the connection is automatically initialized after finding existing channel configuration.
  private autoStarted = false;

  private debug = false;

  private logging?: CommunicationLayerLoggingOptions;

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
    logging,
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
    if (storage?.duration) {
      this.sessionDuration = DEFAULT_SESSION_TIMEOUT_MS;
    }
    this.storageOptions = storage;
    this.autoConnectOptions = autoConnect;
    this.debug = logging?.remoteLayer === true;
    this.logging = logging;

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
          logging: this.logging,
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
          logging: this.logging,
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
      EventType.MESSAGE,
      (_message: CommunicationLayerMessage) => {
        let message = _message;
        // check if message is encapsulated for backward compatibility
        if (_message.message) {
          message = message.message as CommunicationLayerMessage;
        }
        this.onCommunicationLayerMessage(message);
      },
    );

    this.communicationLayer?.on(EventType.KEY_INFO, (keyInfo) => {
      if (this.debug) {
        console.debug(
          `RemoteCommunication::${this.context}::on 'KEY_INFO' `,
          keyInfo,
        );
      }
      this.emitServiceStatusEvent();
    });

    this.communicationLayer?.on(EventType.CLIENTS_READY, (message) => {
      if (this.debug) {
        console.debug(
          `RemoteCommunication::${this.context}::on 'clients_ready' `,
          message,
        );
      }

      this.setConnectionStatus(ConnectionStatus.LINKED);
      this.setLastActiveDate(new Date());

      if (this.analytics && this.channelId) {
        SendAnalytics({
          id: this.channelId,
          event: TrackingEvents.CONNECTED,
        });
      }

      // this.connected = true;
      // this.emit(EventType.CLIENTS_READY);

      if (!message.isOriginator) {
        // Don't send originator message from mobile.
        return;
      }

      this.isOriginator = message.isOriginator;

      this.communicationLayer?.sendMessage({
        type: MessageType.ORIGINATOR_INFO,
        originatorInfo,
      });
    });

    this.communicationLayer?.on(
      EventType.CLIENTS_DISCONNECTED,
      (channelId: string) => {
        if (this.debug) {
          console.debug(
            `RemoteCommunication::${this.context}]::on 'clients_disconnected' channelId=${channelId}`,
          );
        }

        // Then pause or cleanup the listeners.
        if (this.paused) {
          if (this.debug) {
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
        this.emit(EventType.CLIENTS_DISCONNECTED, this.channelId);
        this.setConnectionStatus(ConnectionStatus.WAITING);
      },
    );

    this.communicationLayer?.on(EventType.CHANNEL_CREATED, (id) => {
      if (this.debug) {
        console.debug(
          `RemoteCommunication::${this.context}::on 'channel_created' channelId=${id}`,
        );
      }
      this.emit(EventType.CHANNEL_CREATED, id);
    });

    this.communicationLayer?.on(EventType.CLIENTS_WAITING, (numberUsers) => {
      if (this.debug) {
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
        if (this.debug) {
          console.debug(
            `RemoteCommunication::on 'clients_waiting' watch autoStarted=${this.autoStarted} timeout`,
            this.autoConnectOptions,
          );
        }
        const timeoutId = setTimeout(() => {
          if (this.debug) {
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

      this.emit(EventType.CLIENTS_WAITING, numberUsers);
    });
  }

  private onCommunicationLayerMessage(message: CommunicationLayerMessage) {
    if (this.debug) {
      console.debug(
        `RemoteCommunication::${
          this.context
        }::on 'message' typeof=${typeof message}`,
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
      this.emit(EventType.CLIENTS_READY, {
        isOriginator: this.isOriginator,
        originatorInfo: message.originatorInfo,
      });
      this.paused = false;
      return;
    } else if (message.type === MessageType.WALLET_INFO) {
      this.walletInfo = message.walletInfo;
      this.connected = true;
      this.emit(EventType.CLIENTS_READY, {
        isOriginator: this.isOriginator,
        walletInfo: message.walletInfo,
      });
      this.paused = false;
      return;
    } else if (message.type === MessageType.TERMINATE) {
      // Needs to manually emit CLIENTS_DISCONNECTED because it won't receive it after the socket is closed.
      this.emit(EventType.CLIENTS_DISCONNECTED);
      // remove channel config from persistence layer and close active connections.
      this.storageManager?.terminate(this.channelId ?? '');
      this.disconnect();
      this.resetKeys();
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
      this.emit(EventType.CLIENTS_READY, {
        isOriginator: this.isOriginator,
        walletInfo: this.walletInfo,
      });
    }

    // FIXME should it only emit JSON-RPC message?
    this.emit(EventType.MESSAGE, message);
  }

  async startAutoConnect(): Promise<ChannelConfig | undefined> {
    if (!this.storageManager) {
      if (this.debug) {
        console.debug(
          `RemoteCommunication::startAutoConnect() no storage manager defined - skip`,
        );
      }
      return undefined;
    }

    const channelConfig = await this.storageManager.getPersistedChannelConfig(
      this.channelId ?? '',
    );
    if (this.debug) {
      console.debug(
        `RemoteCommunication::startAutoConnect() autoStarted=${this.autoStarted} channelConfig`,
        channelConfig,
      );
    }

    if (this.autoStarted) {
      // Prevent infinite loop by checking if it was already autoStarted.
      if (this.debug) {
        console.debug(
          `RemoteCommunication::startAutoConnect() already autoStarted - exit autoConnect()`,
        );
      }
      return channelConfig;
    }

    // is socket already connected?
    const connected = this.communicationLayer?.isConnected();
    if (connected) {
      if (this.debug) {
        console.debug(
          `RemoteCommunication::startAutoConnect() socket already connected - exit autoConnect()`,
        );
      }
      return channelConfig;
    }

    if (channelConfig) {
      const validSession = channelConfig.validUntil > Date.now();

      if (validSession) {
        this.channelConfig = channelConfig;
        this.autoStarted = true;
        this.channelId = channelConfig?.channelId;
        this.communicationLayer?.connectToChannel({
          channelId: channelConfig.channelId,
          isOriginator: true,
        });
        return Promise.resolve(channelConfig);
      } else if (this.debug) {
        console.log(`RemoteCommunication::autoConnect Session has expired`);
      }
    } else if (this.debug) {
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

    if (this.debug) {
      console.debug(`RemoteCommunication::generateChannelId()`);
    }

    this.clean();
    const channel = this.communicationLayer.createChannel();

    console.debug(`RemoteCommunication::generateChannelId() `, channel);
    const channelConfig = {
      channelId: channel.channelId,
      validUntil: Date.now() + this.sessionDuration,
    };
    this.channelId = channel.channelId;
    this.channelConfig = channelConfig;
    // save current channel config
    this.storageManager?.persistChannelConfig(channelConfig);

    return { channelId: this.channelId, pubKey: channel.pubKey };
  }

  clean() {
    if (this.debug) {
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

    if (this.debug) {
      console.debug(
        `RemoteCommunication::${this.context}::connectToChannel() channelId=${channelId}`,
      );
    }

    if (this.communicationLayer?.isConnected()) {
      // Adding a check on previous connection to prevent reconnecting during dev when HMR is enabled
      console.debug(
        `RemoteCommunication::${this.context}::connectToChannel() already connected - interrup connection.`,
      );
      return;
    }

    this.channelId = channelId;
    this.communicationLayer?.connectToChannel({ channelId });
    const newChannelConfig: ChannelConfig = {
      channelId,
      validUntil: Date.now() + this.sessionDuration,
    };
    this.channelConfig = newChannelConfig;
    this.storageManager?.persistChannelConfig(newChannelConfig);
  }

  sendMessage(message: CommunicationLayerMessage) {
    if (this.debug) {
      console.log(`RemoteCommunication::${this.context}::sendMessage`, message);
    }

    if (this.paused) {
      this.once(EventType.CLIENTS_READY, () => {
        // only send the message after the clients has awaken.
        this.communicationLayer?.sendMessage(message);
      });
    } else {
      this.communicationLayer?.sendMessage(message);
    }
  }

  async testStorage() {
    const res = await this.storageManager?.getPersistedChannelConfig(
      this.channelId ?? '',
    );
    console.debug(`RemoteCommunication.testStorage() res`, res);
  }

  private setLastActiveDate(lastActiveDate: Date) {
    if (this.debug) {
      console.debug(`RemoteCommunication::setLastActiveDate()`, lastActiveDate);
    }
    const newChannelConfig: ChannelConfig = {
      channelId: this.channelId ?? '',
      validUntil: this.channelConfig?.validUntil ?? 0,
      lastActive: lastActiveDate.getTime(),
    };
    this.storageManager?.persistChannelConfig(newChannelConfig);
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
    if (this.debug) {
      console.debug(
        `RemoteCommunication::setConnectionStatus `,
        connectionStatus,
      );
    }
    this._connectionStatus = connectionStatus;
    this.emit(EventType.CONNECTION_STATUS, connectionStatus);
    this.emitServiceStatusEvent();
  }

  private emitServiceStatusEvent() {
    this.emit(EventType.SERVICE_STATUS, this.getServiceStatus());
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

  resetKeys() {
    this.communicationLayer?.resetKeys();
  }

  pause() {
    if (this.debug) {
      console.debug(`RemoteCommunication::pause() `);
    }
    this.communicationLayer?.pause();
    this.setConnectionStatus(ConnectionStatus.PAUSED);
  }

  resume() {
    if (this.debug) {
      console.debug(`RemoteCommunication::resume() `);
    }
    this.communicationLayer?.resume();
    this.setConnectionStatus(ConnectionStatus.LINKED);
  }

  disconnect(options?: DisconnectOptions) {
    if (this.debug) {
      console.debug(`RemoteCommunication::disconnect() `);
    }

    if (options?.terminate) {
      this.setConnectionStatus(ConnectionStatus.TERMINATED);
      // remove channel config from persistence layer and close active connections.
      this.storageManager?.terminate(this.channelId ?? '');
    } else {
      this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
    }

    this.connected = false;
    this.communicationLayer?.disconnect(options);
  }
}
