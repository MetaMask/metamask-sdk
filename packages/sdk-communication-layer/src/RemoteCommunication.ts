import { EventEmitter2 } from 'eventemitter2';
import { validate } from 'uuid';
import SendAnalytics from './Analytics';
import { DEFAULT_SERVER_URL, VERSION } from './config';
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
  communicationServerUrl: string;
  context: string;
}

export class RemoteCommunication extends EventEmitter2 {
  connected = false;

  isOriginator = false;

  paused = false;

  otherPublicKey?: string;

  webRTCLib?: WebRTCLib;

  transports?: string[];

  platform: string;

  enableDebug = false;

  channelId?: string;

  walletInfo?: WalletInfo;

  communicationLayer?: CommunicationLayer;

  originatorInfo?: OriginatorInfo;

  dappMetadata?: DappMetadata;

  communicationServerUrl?: string;

  context: string;

  constructor({
    platform,
    communicationLayerPreference,
    otherPublicKey,
    webRTCLib,
    reconnect,
    dappMetadata,
    transports,
    context,
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
      communicationServerUrl,
    });
  }

  initCommunicationLayer({
    communicationLayerPreference,
    otherPublicKey,
    webRTCLib,
    reconnect,
    communicationServerUrl,
  }: Pick<
    RemoteCommunicationProps,
    | 'communicationLayerPreference'
    | 'otherPublicKey'
    | 'webRTCLib'
    | 'reconnect'
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
          context: this.context,
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
        console.debug(`[${this.context}] received 'message' `, message);
        this.onCommunicationLayerMessage(message);
      },
    );

    this.communicationLayer.on(
      MessageType.MESSAGE,
      (message: CommunicationLayerMessage) => {
        console.debug(`[${this.context}] received 'message' `, message);
        this.onCommunicationLayerMessage(message);
      },
    );

    this.communicationLayer.on(MessageType.CLIENTS_READY, (message) => {
      console.debug(`[${this.context}] received 'clients_ready' `, message);

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

      this.emit(MessageType.CLIENTS_READY);
    });

    this.communicationLayer.on(MessageType.CLIENTS_DISCONNECTED, () => {
      console.debug(`[${this.context}] received 'clients_disconnected' `);

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
      // FIXME why was it in previous code?
      // this.initCommunicationLayer({
      //   communicationLayerType,
      //   otherPublicKey,
      //   webRTCLib,
      //   reconnect: false,
      // });

      this.emit(MessageType.CLIENTS_DISCONNECTED);
    });

    this.communicationLayer.on(MessageType.CHANNEL_CREATED, (id) => {
      console.debug(`[${this.context}] received 'channel_created' `, id);
      this.emit(MessageType.CHANNEL_CREATED, id);
    });

    this.communicationLayer.on(MessageType.CLIENTS_WAITING, (numberUsers) => {
      if (this.enableDebug) {
        console.debug(
          `[${this.context}]  received 'clients_waiting' `,
          numberUsers,
        );

        SendAnalytics({
          id: this.channelId ?? '',
          event: TrackingEvents.REQUEST,
          ...originatorInfo,
          commLayer: this.communicationLayer,
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
    if (this.paused) {
      this.once(MessageType.CLIENTS_READY, () => {
        this.communicationLayer?.sendMessage(message);
      });
    } else {
      this.communicationLayer?.sendMessage(message);
    }
  }

  onCommunicationLayerMessage(message: CommunicationLayerMessage) {
    console.debug(`[${this.context}] received communication layer`, message);

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

    this.emit(MessageType.MESSAGE, { message });
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
