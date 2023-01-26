/* eslint-disable no-console */
import { EventEmitter2 } from 'eventemitter2';
import { KeyExchange, KeyExchangeProps } from './KeyExchange';
import { SocketService, SocketServiceProps } from './SocketService';
import { CommunicationLayer } from './types/CommunicationLayer';
import { CommunicationLayerMessage } from './types/CommunicationLayerMessage';
import { ConnectToChannelOptions } from './types/ConnectToChannelOptions';
import { DisconnectOptions } from './types/DisconnectOptions';
import { KeyInfo } from './types/KeyInfo';
import { MessageType } from './types/MessageType';
import { WebRTCLib } from './types/WebRTCLib';

export interface WebRTCServiceProps extends SocketServiceProps {
  webRTCLib?: WebRTCLib;
}

export class WebRTCService extends EventEmitter2 implements CommunicationLayer {
  handshakeDone = false;

  isOriginator = false;

  clientsConnected = false;

  clientsReady = false;

  socketService: SocketService;

  webrtc?: RTCPeerConnection;

  dataChannel?: RTCDataChannel;

  keyExchange: KeyExchange;

  RTCPeerConnection: any;

  RTCSessionDescription: any;

  RTCIceCandidate: any;

  reconnect?: boolean;

  context: string;

  debug: boolean;

  constructor({
    otherPublicKey,
    webRTCLib,
    communicationLayerPreference,
    reconnect,
    transports,
    context,
    ecies,
    communicationServerUrl,
    debug = false,
  }: WebRTCServiceProps) {
    super();
    this.reconnect = reconnect;
    this.context = context;
    this.debug = debug;

    if (webRTCLib) {
      this.RTCPeerConnection = webRTCLib.RTCPeerConnection;
      this.RTCSessionDescription = webRTCLib.RTCSessionDescription;
      this.RTCIceCandidate = webRTCLib.RTCIceCandidate;
    } else {
      this.RTCPeerConnection = RTCPeerConnection;
      this.RTCSessionDescription = RTCSessionDescription;
      this.RTCIceCandidate = RTCIceCandidate;
    }

    this.socketService = new SocketService({
      otherPublicKey,
      communicationLayerPreference,
      reconnect,
      transports,
      communicationServerUrl,
      ecies,
      context,
      debug,
    });

    const keyExchangeInitParameter: KeyExchangeProps = {
      communicationLayer: this,
      otherPublicKey: undefined,
      sendPublicKey: true,
      context: this.context,
      debug,
    };

    this.keyExchange = new KeyExchange(keyExchangeInitParameter);

    this.keyExchange.on(MessageType.KEYS_EXCHANGED, () => {
      this.clientsReady = true;
      this.emit(MessageType.CLIENTS_READY, {
        isOriginator: this.isOriginator,
      });
    });

    this.socketService.on(MessageType.CLIENTS_DISCONNECTED, () => {
      if (!this.clientsConnected) {
        this.socketService.removeAllListeners();
        return this.emit(MessageType.CLIENTS_DISCONNECTED);
      }
      return this.clientsConnected;
    });

    this.socketService.on(MessageType.MESSAGE, async ({ message }) => {
      // TODO message should be typed and protocol documented
      const { offer, answer, candidate, type } = message;
      if (type === MessageType.OFFER) {
        await this.webrtc?.setRemoteDescription(
          new this.RTCSessionDescription(offer),
        );

        const answerLocal = await this.webrtc?.createAnswer();
        await this.webrtc?.setLocalDescription(answerLocal);

        this.socketService.sendMessage({
          type: MessageType.ANSWER,
          answer: answerLocal,
        });
      } else if (type === MessageType.ANSWER) {
        await this.webrtc?.setRemoteDescription(
          new this.RTCSessionDescription(answer),
        );

        this.handshakeDone = true;
      } else if (type === MessageType.CANDIDATE) {
        this.webrtc?.addIceCandidate(new this.RTCIceCandidate(candidate));
      }
    });

    this.socketService.on(
      MessageType.CLIENTS_READY,
      async ({ isOriginator }) => {
        this.setupWebrtc();
        if (!isOriginator) {
          return;
        }

        if (!this.webrtc) {
          throw new Error(`invalid webrtc configuration`);
        }

        const offer: RTCSessionDescriptionInit =
          await this.webrtc.createOffer();

        await this.webrtc.setLocalDescription(offer);

        this.isOriginator = isOriginator;
        this.socketService.sendMessage({ type: MessageType.OFFER, offer });
      },
    );

    this.socketService.on(MessageType.CHANNEL_CREATED, (id) => {
      this.emit(MessageType.CHANNEL_CREATED, id);
    });

    this.socketService.on(MessageType.CLIENTS_WAITING, (numberUsers) => {
      this.emit(MessageType.CLIENTS_WAITING, numberUsers);
    });
  }

  setupWebrtc() {
    const configuration = {
      // FIXME WHAT is this hardcoded value?
      iceServers: [{ urls: 'stun:15.237.115.65' }],
    };

    this.webrtc = new this.RTCPeerConnection(configuration);

    if (!this.webrtc) {
      throw new Error(`invalid webrtc configuration`);
    }

    this.webrtc.ondatachannel = (evt) => {
      console.log('Data channel is created!');
      const receiveChannel = evt.channel;
      receiveChannel.onopen = () => {
        console.log('Data channel is open and ready to be used.');
        this.clientsConnected = true;

        if (this.isOriginator) {
          if (!this.keyExchange.areKeysExchanged()) {
            this.keyExchange.start(this.isOriginator);
          }
        }

        if (this.reconnect) {
          if (this.keyExchange.areKeysExchanged()) {
            this.sendMessage({ type: MessageType.READY });
            this.emit(MessageType.CLIENTS_READY, {
              isOriginator: this.isOriginator,
            });
          } else if (!this.isOriginator) {
            this.sendMessage({ type: MessageType.KEY_HANDSHAKE_START });
          }
          this.reconnect = false;
        }
      };

      this.onMessage = this.onMessage.bind(this);

      receiveChannel.onmessage = this.onMessage;
    };

    this.webrtc.onconnectionstatechange = () => {
      const connectionStatus = this.webrtc?.connectionState ?? 'closed';
      console.log('connectionStatus', connectionStatus);
      if (['disconnected', 'failed', 'closed'].includes(connectionStatus)) {
        return this.emit(MessageType.CLIENTS_DISCONNECTED);
      }

      return connectionStatus;
    };

    this.webrtc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        this.socketService.sendMessage({
          type: MessageType.CANDIDATE,
          candidate,
        });
      }
    };

    this.webrtc.onicecandidateerror = (error) =>
      console.log('ICE ERROR', error);

    this.dataChannel = this.webrtc.createDataChannel('messenger');

    this.dataChannel.onerror = (error) => {
      // FIXME why is it wrong types on event ?
      const fixme = error as unknown as {
        error: {
          code: number;
        };
      };

      if (fixme.error.code === 0) {
        return this.emit(MessageType.CLIENTS_DISCONNECTED);
      }
      console.log('ERROR: datachannel', error);
      return error;
    };
  }

  connectToChannel({ channelId }: ConnectToChannelOptions) {
    this.socketService.connectToChannel({ channelId });
  }

  resetKeys(): void {
    this.socketService.resetKeys();
  }

  onMessage(message: { data: string }) {
    /* if (!message.isTrusted) {
      throw new Error('Message not trusted');
    }*/

    if (!this.keyExchange.areKeysExchanged()) {
      const messageReceived = JSON.parse(message.data);
      if (messageReceived?.type.startsWith('key_handshake')) {
        return this.emit(MessageType.KEY_EXCHANGE, {
          message: messageReceived,
        });
      }
      throw new Error('Keys not exchanged');
    }

    const decryptedMessage = this.keyExchange.decryptMessage(message.data);
    const messageReceived = JSON.parse(decryptedMessage);
    return this.emit(MessageType.MESSAGE, { message: messageReceived });
  }

  sendMessage(message: CommunicationLayerMessage) {
    if (!this.clientsConnected) {
      throw new Error('Clients not connected');
    }

    if (!this.dataChannel) {
      throw new Error(`Invalid webrtc status - data channel is not defined`);
    }

    if (!this.keyExchange.areKeysExchanged()) {
      if (message?.type.startsWith('key_handshake')) {
        return this.dataChannel.send(JSON.stringify(message));
      }
      throw new Error('Keys not exchanged');
    }
    const encryptedMessage = this.keyExchange.encryptMessage(
      JSON.stringify(message),
    );

    return this.dataChannel.send(encryptedMessage);
  }

  createChannel() {
    return this.socketService.createChannel();
  }

  getKeyInfo(): KeyInfo {
    return this.socketService.getKeyInfo();
  }

  pause() {
    if (this.keyExchange.areKeysExchanged()) {
      this.sendMessage({ type: MessageType.PAUSE });
    }
    this.webrtc?.close();
    // this.removeAllListeners();
    this.socketService.pause();
    // this.socket.removeAllListeners();
  }

  resume() {
    this.reconnect = true;
    this.socketService.resume();
  }

  disconnect(options?: DisconnectOptions) {
    this.socketService.disconnect(options);
    this.webrtc?.close();
  }
}
