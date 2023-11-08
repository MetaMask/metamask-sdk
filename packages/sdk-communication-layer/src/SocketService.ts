import { EventEmitter2 } from 'eventemitter2';
import { io, Socket } from 'socket.io-client';
import { DEFAULT_SERVER_URL, DEFAULT_SOCKET_TRANSPORTS } from './config';
import { ECIESProps } from './ECIES';
import { KeyExchange } from './KeyExchange';
import { createChannel } from './services/SocketService/ChannelManager';
import {
  connectToChannel,
  disconnect,
  pause,
  ping,
  resume,
} from './services/SocketService/ConnectionManager';
import { keyCheck, resetKeys } from './services/SocketService/KeysManager';
import { handleSendMessage } from './services/SocketService/MessageHandlers';
import { Channel } from './types/Channel';
import { CommunicationLayer } from './types/CommunicationLayer';
import { CommunicationLayerMessage } from './types/CommunicationLayerMessage';
import { CommunicationLayerPreference } from './types/CommunicationLayerPreference';
import { ConnectToChannelOptions } from './types/ConnectToChannelOptions';
import { DisconnectOptions } from './types/DisconnectOptions';
import { KeyInfo } from './types/KeyInfo';
import { CommunicationLayerLoggingOptions } from './types/LoggingOptions';

export interface SocketServiceProps {
  communicationLayerPreference: CommunicationLayerPreference;
  reconnect?: boolean;
  transports?: string[];
  otherPublicKey?: string;
  communicationServerUrl: string;
  context: string;
  ecies?: ECIESProps;
  logging?: CommunicationLayerLoggingOptions;
}

export interface SocketServiceState {
  clientsConnected: boolean;
  clientsPaused: boolean;
  isOriginator?: boolean;
  channelId?: string;
  manualDisconnect: boolean;
  resumed?: boolean;
  communicationLayerPreference?: CommunicationLayerPreference;
  context?: string;
  withKeyExchange?: boolean;
  communicationServerUrl: string;
  debug?: boolean;
  rpcMethodTracker: RPCMethodCache;
  hasPlaintext: boolean;
  socket?: Socket;
  setupChannelListeners?: boolean;
  keyExchange?: KeyExchange;
}

export interface RPCMethodResult {
  timestamp: number; // timestamp of last request
  method: string;
  result?: unknown;
  error?: unknown;
  elapsedTime?: number; // elapsed time between request and response
}
export interface RPCMethodCache {
  [id: string]: RPCMethodResult;
}

export type SocketServiceInstanceType = SocketService &
  EventEmitter2 &
  CommunicationLayer;

export class SocketService extends EventEmitter2 implements CommunicationLayer {
  public state: SocketServiceState = {
    clientsConnected: false,
    /**
     * Special flag used to session persistence in case MetaMask disconnects without Pause,
     * it means we need to re-create a new key handshake.
     */
    clientsPaused: false,
    manualDisconnect: false,
    rpcMethodTracker: {},
    hasPlaintext: false,
    communicationServerUrl: '',
  };

  constructor({
    otherPublicKey,
    reconnect,
    communicationLayerPreference,
    transports,
    communicationServerUrl,
    context,
    ecies,
    logging,
  }: SocketServiceProps) {
    super();

    this.state.resumed = reconnect;
    this.state.context = context;
    this.state.communicationLayerPreference = communicationLayerPreference;
    this.state.debug = logging?.serviceLayer === true;
    this.state.communicationServerUrl = communicationServerUrl;
    this.state.hasPlaintext =
      this.state.communicationServerUrl !== DEFAULT_SERVER_URL &&
      logging?.plaintext === true;

    const options = {
      autoConnect: false,
      transports: DEFAULT_SOCKET_TRANSPORTS,
    };

    if (transports) {
      options.transports = transports;
    }

    if (this.state.debug) {
      console.debug(
        `SocketService::constructor() Socket IO url: ${this.state.communicationServerUrl}`,
      );
    }

    this.state.socket = io(communicationServerUrl, options);

    const keyExchangeInitParameter = {
      communicationLayer: this,
      otherPublicKey,
      sendPublicKey: false,
      context: this.state.context,
      ecies,
      logging,
    };

    this.state.keyExchange = new KeyExchange(keyExchangeInitParameter);
  }

  resetKeys(): void {
    return resetKeys(this);
  }

  createChannel(): Channel {
    return createChannel(this);
  }

  connectToChannel({
    channelId,
    isOriginator = false,
    withKeyExchange = false,
  }: ConnectToChannelOptions): void {
    return connectToChannel({
      options: {
        channelId,
        isOriginator,
        withKeyExchange,
      },
      instance: this,
    });
  }

  getKeyInfo(): KeyInfo {
    return (this.state.keyExchange as KeyExchange).getKeyInfo();
  }

  keyCheck() {
    return keyCheck(this);
  }

  getKeyExchange() {
    return this.state.keyExchange as KeyExchange;
  }

  sendMessage(message: CommunicationLayerMessage): void {
    return handleSendMessage(this, message);
  }

  ping() {
    return ping(this);
  }

  pause(): void {
    return pause(this);
  }

  isConnected() {
    return this.state.socket?.connected as boolean;
  }

  resume(): void {
    return resume(this);
  }

  getRPCMethodTracker() {
    return this.state.rpcMethodTracker;
  }

  disconnect(options?: DisconnectOptions): void {
    return disconnect(this, options);
  }
}
