import { EventEmitter2 } from 'eventemitter2';
import { validate } from 'uuid';

/* #if _REACTNATIVE
import { createClient } from '@segment/analytics-react-native';
//#elif _NODEJS
import Analytics from 'analytics-node';
//#else */
import { AnalyticsBrowser } from '@segment/analytics-next';
// #endif

import { version } from '../package.json';
import Socket from './Socket';
import WebRTC from './WebRTC';

/* #if _REACTNATIVE
const analytics = createClient({
  writeKey: process.env.SEGMENT_API_KEY,
});
//#elif _NODEJS
const analytics = new Analytics(process.env.SEGMENT_API_KEY);
//#else */
const analytics = AnalyticsBrowser.load({
  writeKey: process.env.SEGMENT_API_KEY,
});
// #endif

enum TrackingEvents {
  REQUEST = 'sdk_connect_request_started',
  CONNECTED = 'sdk_connection_established',
  DISCONNECT = 'sdk_disconnected',
}

export type DappMetadata = {
  url: string;
  name: string;
};

type RemoteCommunicationOptions = {
  platform: string;
  commLayer: string;
  otherPublicKey?: string;
  webRTCLib?: any;
  reconnect?: any;
  dappMetadata?: DappMetadata;
  transports?: string[];
};

export enum CommunicationLayerPreference {
  WEBRTC = 'webrtc',
  SOCKET = 'socket',
  WALLETCONNECT = 'wc',
}

export default class RemoteCommunication extends EventEmitter2 {
  commLayer = null;

  channelId = null;

  connected = false;

  isOriginator: boolean;

  originatorInfo: any;

  walletInfo: any;

  paused: boolean;

  CommLayer: typeof WebRTC | typeof Socket;

  otherPublicKey: string;

  webRTCLib: any;

  dappMetadata: DappMetadata;

  transports: string[];

  platform: string;

  constructor({
    platform,
    commLayer = 'socket',
    otherPublicKey,
    webRTCLib,
    reconnect,
    dappMetadata,
    transports,
  }: RemoteCommunicationOptions) {
    super();

    const CommLayer =
      commLayer === CommunicationLayerPreference.WEBRTC ? WebRTC : Socket;

    this.CommLayer = CommLayer;
    this.otherPublicKey = otherPublicKey;
    this.webRTCLib = webRTCLib;
    this.dappMetadata = dappMetadata;
    this.transports = transports;
    this.platform = platform;

    this.setupCommLayer({
      CommLayer,
      otherPublicKey,
      webRTCLib,
      commLayer,
      reconnect,
    });
  }

  setupCommLayer({
    CommLayer,
    otherPublicKey,
    webRTCLib,
    commLayer,
    reconnect,
  }) {
    this.commLayer = new CommLayer({
      otherPublicKey,
      webRTCLib,
      commLayer,
      reconnect,
      transports: this.transports,
    });

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

    const originatorInfo = {
      url,
      title,
      platform: this.platform,
    };

    this.commLayer.on('message', ({ message }) => {
      this.onMessageCommLayer(message);
    });

    this.commLayer.on('clients_ready', ({ isOriginator }) => {
      this.isOriginator = isOriginator;

      if (!isOriginator) {
        return;
      }

      this.commLayer.sendMessage({
        type: 'originator_info',
        originatorInfo,
      });

      analytics.track(TrackingEvents.CONNECTED);
    });

    this.commLayer.on('clients_disconnected', () => {
      if (this.paused) {
        return;
      }

      if (!this.isOriginator) {
        this.paused = true;
        return;
      }

      this.clean();
      this.commLayer.removeAllListeners();
      this.setupCommLayer({
        CommLayer,
        otherPublicKey,
        webRTCLib,
        commLayer: this.commLayer,
        reconnect: false,
      });
      this.emit('clients_disconnected');

      analytics.track(TrackingEvents.DISCONNECT);
    });

    this.commLayer.on('channel_created', (id) => {
      this.emit('channel_created', id);
    });

    this.commLayer.on('clients_waiting_to_join', (numberUsers) => {
      this.emit('clients_waiting_to_join', numberUsers);

      analytics.track(TrackingEvents.REQUEST, {
        ...originatorInfo,
        commLayer: this.commLayer,
        sdkVersion: version,
      });
    });
  }

  clean() {
    this.channelId = null;
    this.connected = false;
  }

  connectToChannel(id) {
    if (!validate(id)) {
      throw new Error('Invalid channel');
    }
    this.commLayer.connectToChannel(id);
  }

  sendMessage(message) {
    if (this.paused) {
      this.once('clients_ready', () => {
        this.commLayer.sendMessage(message);
      });
    } else {
      this.commLayer.sendMessage(message);
    }
  }

  onMessageCommLayer(message) {
    if (message.type === 'originator_info') {
      this.commLayer.sendMessage({
        type: 'wallet_info',
        walletInfo: {
          type: 'MetaMask',
          version: 'MetaMask/Mobile',
        },
      });
      this.originatorInfo = message.originatorInfo;
      this.connected = true;
      this.emit('clients_ready', {
        isOriginator: this.isOriginator,
        originatorInfo: message.originatorInfo,
      });
      this.paused = false;
      return;
    } else if (message.type === 'wallet_info') {
      this.walletInfo = message.walletInfo;
      this.connected = true;
      this.emit('clients_ready', {
        isOriginator: this.isOriginator,
        walletInfo: message.walletInfo,
      });
      this.paused = false;
      return;
    } else if (message.type === 'pause') {
      this.paused = true;
    } else if (message.type === 'ready') {
      this.paused = false;
      this.emit('clients_ready', {
        isOriginator: this.isOriginator,
        walletInfo: this.walletInfo,
      });
    }

    this.emit('message', { message });
  }

  generateChannelId() {
    if (this.connected) {
      throw new Error('Channel already created');
    }

    this.clean();

    const { channelId, pubKey } = this.commLayer.createChannel();
    this.channelId = channelId;
    return { channelId, pubKey };
  }

  pause() {
    this.commLayer.pause();
  }

  resume() {
    this.commLayer.resume();
  }

  disconnect() {
    this.commLayer.disconnect();
  }
}
