/* eslint-disable import/prefer-default-export */
import { EventEmitter2 } from 'eventemitter2';
import { validate } from 'uuid';
import { SendAnalytics } from './Analytics';
import { DEFAULT_SERVER_URL, VERSION } from './config';
import { ECIESProps } from './ECIES';
import { SocketService } from './SocketService';
import { CommunicationLayer } from './types/CommunicationLayer';
import { CommunicationLayerMessage } from './types/CommunicationLayerMessage';
import { CommunicationLayerPreference } from './types/CommunicationLayerPreference';
import { DappMetadata } from './types/DappMetadata';
import { MessageType } from './types/MessageType';
import { OriginatorInfo } from './types/OriginatorInfo';
import { TrackingEvents } from './types/TrackingEvent';
import { WalletInfo } from './types/WalletInfo';
import { WebRTCLib } from './types/WebRTCLib';
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

  private walletInfo?: WalletInfo;

  private communicationLayer?: CommunicationLayer;

  private originatorInfo?: OriginatorInfo;

  private dappMetadata?: DappMetadata;

  private communicationServerUrl: string;

  private context: string;

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

    this.communicationLayer.on(
      MessageType.MESSAGE,
      (message: CommunicationLayerMessage) => {
        this.onCommunicationLayerMessage(message);
      },
    );

    this.communicationLayer.on(MessageType.CLIENTS_READY, (message) => {
      if (this.enableDebug) {
        console.debug(
          `[communication][${this.context}] received 'clients_ready' `,
          message,
        );
      }

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

    this.communicationLayer.on(
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

        if (!this.isOriginator) {
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

    this.communicationLayer.on(MessageType.CHANNEL_CREATED, (id) => {
      if (this.enableDebug) {
        console.debug(
          `RemoteCommunication::${this.context}::on 'channel_created' channelId=${id}`,
        );
      }
      this.emit(MessageType.CHANNEL_CREATED, id);
    });

    this.communicationLayer.on(MessageType.CLIENTS_WAITING, (numberUsers) => {
      if (this.enableDebug) {
        console.debug(
          `RemoteCommunication::${this.context}::on 'clients_waiting' numberUsers=${numberUsers}`,
        );

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

  generateChannelId() {
    if (!this.communicationLayer) {
      throw new Error('communication layer not initialized');
    }

    if (this.connected) {
      throw new Error('Channel already created');
    }

    this.clean();

    const { channelId, pubKey } = this.communicationLayer.createChannel();
    this.channelId = channelId;
    return { channelId, pubKey };
  }

  isConnected() {
    return this.connected;
  }

  isPaused() {
    return this.paused;
  }

  pause() {
    this.communicationLayer?.pause();
  }

  resume() {
    this.communicationLayer?.resume();
  }

  disconnect() {
    this.communicationLayer?.disconnect();
  }
}
