/* eslint-disable import/prefer-default-export */
import { EventEmitter2 } from 'eventemitter2';
import { validate } from 'uuid';
import { SendAnalytics } from './Analytics';
import {
  DEFAULT_SERVER_URL,
  DEFAULT_SESSION_TIMEOUT_MS,
  VERSION,
} from './config';
import { ECIESProps } from './ECIES';
import { SocketService } from './SocketService';
import { ChannelConfig } from './types/ChannelConfig';
import { CommunicationLayer } from './types/CommunicationLayer';
import { CommunicationLayerMessage } from './types/CommunicationLayerMessage';
import { CommunicationLayerPreference } from './types/CommunicationLayerPreference';
import { ConnectionStatus } from './types/ConnectionStatus';
import { DappMetadata } from './types/DappMetadata';
import { MessageType } from './types/MessageType';
import { OriginatorInfo } from './types/OriginatorInfo';
import { TrackingEvents } from './types/TrackingEvent';
import { WalletInfo } from './types/WalletInfo';
import { WebRTCLib } from './types/WebRTCLib';
import { StorageManager } from './utils/StorageManager';
import { WebRTCService } from './WebRTCService';

interface RemoteCommunicationProps {
  platform: string;
  communicationLayerPreference: CommunicationLayerPreference;
  otherPublicKey?: string;
  webRTCLib?: WebRTCLib;
  reconnect?: boolean;
  dappMetadata?: DappMetadata;
  transports?: string[];
  enableDebug?: boolean;
  communicationServerUrl?: string;
  ecies?: ECIESProps;
  context: string;
}

export class RemoteCommunication extends EventEmitter2 {
  private connected = false;

  private isOriginator = false;

  private paused = false;

  private otherPublicKey?: string;

  private webRTCLib?: WebRTCLib;

  private transports?: string[];

  private platform: string;

  private enableDebug = false;

  private channelId?: string;

  private channelConfig?: ChannelConfig;

  private walletInfo?: WalletInfo;

  private communicationLayer?: CommunicationLayer;

  private originatorInfo?: OriginatorInfo;

  private dappMetadata?: DappMetadata;

  private communicationServerUrl: string;

  private context: string;

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
    enableDebug = false,
    communicationServerUrl = DEFAULT_SERVER_URL,
  }: RemoteCommunicationProps) {
    super();

    this.otherPublicKey = otherPublicKey;
    this.webRTCLib = webRTCLib;
    this.dappMetadata = dappMetadata;
    this.transports = transports;
    this.platform = platform;
    this.enableDebug = enableDebug;
    this.communicationServerUrl = communicationServerUrl;
    this.context = context;
    this.setConnectionStatus(ConnectionStatus.DISCONNECTED);

    this.initCommunicationLayer({
      communicationLayerPreference,
      otherPublicKey,
      webRTCLib,
      reconnect,
      ecies,
      communicationServerUrl,
    });
  }

  initCommunicationLayer({
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
          debug: this.enableDebug,
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
          debug: this.enableDebug,
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
      (message: CommunicationLayerMessage) => {
        this.onCommunicationLayerMessage(message);
      },
    );

    this.communicationLayer?.on(MessageType.CLIENTS_READY, (message) => {
      if (this.enableDebug) {
        console.debug(
          `[communication][${this.context}] received 'clients_ready' `,
          message,
        );
      }

      this.setConnectionStatus(ConnectionStatus.LINKED);

      if (this.enableDebug && this.channelId) {
        SendAnalytics({
          id: this.channelId,
          event: TrackingEvents.CONNECTED,
        });
      }

      if (!message.isOriginator) {
        return;
      }

      this.isOriginator = message.isOriginator;

      this.communicationLayer?.sendMessage({
        type: MessageType.ORIGINATOR_INFO,
        originatorInfo,
      });

      this.connected = true;
      this.emit(MessageType.CLIENTS_READY);
    });

    this.communicationLayer?.on(
      MessageType.CLIENTS_DISCONNECTED,
      (channelId: string) => {
        if (this.enableDebug) {
          console.debug(
            `RemoteCommunication::${this.context}]::on 'clients_disconnected' channelId=${channelId}`,
          );
        }

        // First bubble up the disconnect event otherwise it would be missed.
        this.emit(MessageType.CLIENTS_DISCONNECTED, this.channelId);

        // Then pause or cleanup the listeners.
        if (this.paused) {
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

        if (this.enableDebug && this.channelId) {
          SendAnalytics({
            id: this.channelId,
            event: TrackingEvents.DISCONNECTED,
          });
        }

        this.clean();
        this.communicationLayer?.removeAllListeners();
      },
    );

    this.communicationLayer?.on(MessageType.CHANNEL_CREATED, (id) => {
      if (this.enableDebug) {
        console.debug(
          `RemoteCommunication::${this.context}::on 'channel_created' channelId=${id}`,
        );
      }
      this.emit(MessageType.CHANNEL_CREATED, id);
    });

    this.communicationLayer?.on(MessageType.CLIENTS_WAITING, (numberUsers) => {
      if (this.enableDebug) {
        console.debug(
          `RemoteCommunication::${this.context}::on 'clients_waiting' numberUsers=${numberUsers}`,
        );

        this.setConnectionStatus(ConnectionStatus.WAITING);
        SendAnalytics({
          id: this.channelId ?? '',
          event: TrackingEvents.REQUEST,
          ...originatorInfo,
          communicationLayerPreference,
          sdkVersion: VERSION,
        });
      }
      this.emit(MessageType.CLIENTS_WAITING, numberUsers);
    });
  }

  clean() {
    if (this.enableDebug) {
      console.debug(`RemoteCommunication::${this.context}::clean()`);
    }
    this.channelId = undefined;
    this.connected = false;
  }

  connectToChannel(channelId: string) {
    if (!validate(channelId)) {
      throw new Error('Invalid channel');
    }
    this.communicationLayer?.connectToChannel(channelId);
  }

  sendMessage(message: CommunicationLayerMessage) {
    if (this.enableDebug) {
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

  onCommunicationLayerMessage(message: CommunicationLayerMessage) {
    if (this.enableDebug) {
      console.debug(
        `RemoteCommunication::${this.context}::onCommunicationLayerMessage`,
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
    } else if (message.type === MessageType.PAUSE) {
      this.paused = true;
    } else if (message.type === MessageType.READY) {
      this.paused = false;
      this.emit(MessageType.CLIENTS_READY, {
        isOriginator: this.isOriginator,
        walletInfo: this.walletInfo,
      });
    }

    this.emit(MessageType.MESSAGE, message);
  }

  startAutoConnect() {
    const channelConfig = StorageManager.getPersistedChannelConfig();
    console.debug(
      `RemoteCommunication::autoConnect channelConfig`,
      channelConfig,
    );

    if (channelConfig) {
      const validSession = channelConfig.validUntil > new Date();
      console.debug(
        `validUntil=${channelConfig.validUntil} vs new Date()=${new Date()}`,
        validSession,
      );

      if (validSession) {
        this.channelConfig = channelConfig;
        this.communicationLayer?.connectToChannel(
          channelConfig.channelId,
          true,
        );
      } else {
        console.log(`RemoteCommunication::autoConnect Session has expired`);
      }
    } else {
      console.debug(`RemoteCommunication::autoConnect not available`);
    }
  }

  generateChannelId() {
    if (!this.communicationLayer) {
      throw new Error('communication layer not initialized');
    }

    if (this.connected) {
      throw new Error('Channel already created');
    }

    this.clean();
    const channel = this.communicationLayer.createChannel();

    const channelConfig = {
      channelId: channel.channelId,
      validUntil: new Date(Date.now() + DEFAULT_SESSION_TIMEOUT_MS),
    };
    this.channelConfig = channelConfig;
    // save current channel config
    StorageManager.persistChannelConfig(channelConfig);

    this.channelId = channel.channelId;

    return { channelId: this.channelId, pubKey: channel.pubKey };
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

  resetKeys() {
    // Reset key exchange
    console.debug(`RemoteCommunication::resetKeys()`);
    this.communicationLayer?.resetKeys();
  }

  private setConnectionStatus(connectionStatus: ConnectionStatus) {
    if (this.enableDebug) {
      console.debug(
        `RemoteCommunication::setConenctionStatus `,
        connectionStatus,
      );
    }
    this._connectionStatus = connectionStatus;
    this.emit(MessageType.CONNECTION_STATUS, connectionStatus);
  }

  getConnectionStatus() {
    return this._connectionStatus;
  }

  getKeyInfo() {
    return this.communicationLayer?.getKeyInfo();
  }

  pause() {
    if (this.enableDebug) {
      console.debug(`RemoteCommunication::pause() `);
    }
    this.communicationLayer?.pause();
    this.setConnectionStatus(ConnectionStatus.PAUSED);
  }

  resume() {
    if (this.enableDebug) {
      console.debug(`RemoteCommunication::resume() `);
    }
    this.communicationLayer?.resume();
    this.setConnectionStatus(ConnectionStatus.LINKED);
  }

  disconnect() {
    if (this.enableDebug) {
      console.debug(`RemoteCommunication::disconnect() `);
    }
    this.communicationLayer?.disconnect();
    this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
  }
}
