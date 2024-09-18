import debug from 'debug';
import { EventEmitter2 } from 'eventemitter2';
import { io, ManagerOptions, Socket, SocketOptions } from 'socket.io-client';
import { DEFAULT_SERVER_URL, DEFAULT_SOCKET_TRANSPORTS } from './config';
import { ECIES, ECIESProps } from './ECIES';
import { KeyExchange, KeyExchangeProps } from './KeyExchange';
import { RemoteCommunication } from './RemoteCommunication';
import { createChannel } from './services/SocketService/ChannelManager';
import {
  connectToChannel,
  disconnect,
  pause,
  ping,
  resume,
  setupSocketFocusListener,
} from './services/SocketService/ConnectionManager';
import { keyCheck, resetKeys } from './services/SocketService/KeysManager';
import { handleSendMessage } from './services/SocketService/MessageHandlers';
import { CommunicationLayerMessage } from './types/CommunicationLayerMessage';
import { CommunicationLayerPreference } from './types/CommunicationLayerPreference';
import { ConnectToChannelOptions } from './types/ConnectToChannelOptions';
import { DisconnectOptions } from './types/DisconnectOptions';
import { KeyInfo } from './types/KeyInfo';
import { CommunicationLayerLoggingOptions } from './types/LoggingOptions';
import { logger } from './utils/logger';

export interface SocketServiceProps {
  communicationLayerPreference: CommunicationLayerPreference;
  reconnect?: boolean;
  transports?: string[];
  otherPublicKey?: string;
  communicationServerUrl: string;
  context: string;
  ecies?: ECIESProps;
  remote: RemoteCommunication;
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
  eciesInstance?: ECIES;
  withKeyExchange?: boolean;
  communicationServerUrl: string;
  debug?: boolean;
  rpcMethodTracker: RPCMethodCache;
  lastRpcId?: string;
  hasPlaintext: boolean;
  socket?: Socket;
  setupChannelListeners?: boolean;
  analytics?: boolean;
  keyExchange?: KeyExchange;
  focusListenerAdded: boolean;
  removeFocusListener?: () => void;
  isReconnecting: boolean;
  reconnectionAttempts: number;
}

export interface RPCMethodResult {
  id: string;
  timestamp: number; // timestamp of last request
  method: string;
  result?: unknown;
  error?: unknown;
  elapsedTime?: number; // elapsed time between request and response
}
export interface RPCMethodCache {
  [id: string]: RPCMethodResult;
}

export class SocketService extends EventEmitter2 {
  public state: SocketServiceState = {
    clientsConnected: false,
    /**
     * Special flag used to session persistence in case MetaMask disconnects without Pause,
     * it means we need to re-create a new key handshake.
     */
    clientsPaused: false,
    manualDisconnect: false,
    lastRpcId: undefined,
    rpcMethodTracker: {},
    hasPlaintext: false,
    communicationServerUrl: '',
    focusListenerAdded: false,
    removeFocusListener: undefined,
    isReconnecting: false,
    reconnectionAttempts: 0,
  };

  remote: RemoteCommunication;

  options: SocketServiceProps;

  constructor(options: SocketServiceProps) {
    super();

    this.options = options;
    const {
      reconnect,
      communicationLayerPreference,
      communicationServerUrl,
      context,
      remote,
      logging,
    } = options;

    this.state.resumed = reconnect;
    this.state.context = context;
    this.state.isOriginator = remote.state.isOriginator;
    this.state.communicationLayerPreference = communicationLayerPreference;
    this.state.debug = logging?.serviceLayer === true;
    this.remote = remote;

    if (logging?.serviceLayer === true) {
      debug.enable('SocketService:Layer');
    }

    this.state.communicationServerUrl = communicationServerUrl;
    this.state.hasPlaintext =
      this.state.communicationServerUrl !== DEFAULT_SERVER_URL &&
      logging?.plaintext === true;

    logger.SocketService(
      `[SocketService: constructor()] Socket IO url: ${this.state.communicationServerUrl}`,
    );

    this.initSocket();
  }

  initSocket() {
    const { otherPublicKey, ecies, logging } = this.options;
    const socketOptions: Partial<ManagerOptions & SocketOptions> = {
      autoConnect: false,
      transports: DEFAULT_SOCKET_TRANSPORTS,
      withCredentials: true,
    };

    const url = this.state.communicationServerUrl;
    logger.SocketService(`[SocketService: initSocket()] Socket IO url: ${url}`);

    this.state.socket = io(url, socketOptions);

    // Make sure to always be connected and retrieve messages
    setupSocketFocusListener(this);

    const keyExchangeInitParameter: KeyExchangeProps = {
      communicationLayer: this,
      otherPublicKey,
      sendPublicKey: false,
      context: this.state.context ?? '',
      ecies,
      logging,
    };

    this.state.keyExchange = new KeyExchange(keyExchangeInitParameter);
  }

  resetKeys(): void {
    return resetKeys(this);
  }

  async createChannel() {
    return createChannel(this);
  }

  connectToChannel({
    channelId,
    withKeyExchange = false,
    authorized,
  }: ConnectToChannelOptions): Promise<void> {
    return connectToChannel({
      options: {
        channelId,
        withKeyExchange,
        authorized,
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

  async sendMessage(message: CommunicationLayerMessage): Promise<void> {
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
