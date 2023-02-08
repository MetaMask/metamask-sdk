/* eslint-disable padding-line-between-statements */
import { EventEmitter2 } from 'eventemitter2';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_SOCKET_TRANSPORTS } from './config';
import { ECIESProps } from './ECIES';
import { KeyExchange } from './KeyExchange';
import { Channel } from './types/Channel';
import { CommunicationLayer } from './types/CommunicationLayer';
import { CommunicationLayerMessage } from './types/CommunicationLayerMessage';
import { CommunicationLayerPreference } from './types/CommunicationLayerPreference';
import { ConnectToChannelOptions } from './types/ConnectToChannelOptions';
import { DisconnectOptions } from './types/DisconnectOptions';
import { KeyInfo } from './types/KeyInfo';
import { MessageType } from './types/MessageType';
import { ServiceStatus } from './types/ServiceStatus';

export interface SocketServiceProps {
  communicationLayerPreference: CommunicationLayerPreference;
  reconnect?: boolean;
  transports?: string[];
  otherPublicKey?: string;
  communicationServerUrl: string;
  context: string;
  ecies?: ECIESProps;
  debug: boolean;
}

export class SocketService extends EventEmitter2 implements CommunicationLayer {
  private socket: Socket;

  private clientsConnected = false;

  private clientsReady = false;

  private isOriginator?: boolean;

  private channelId?: string;

  private keyExchange: KeyExchange;

  private manualDisconnect = false;

  private reconnect?: boolean;

  private communicationLayerPreference: CommunicationLayerPreference;

  private context: string;

  private communicationServerUrl: string;

  private debug: boolean;

  constructor({
    otherPublicKey,
    reconnect,
    communicationLayerPreference,
    transports,
    communicationServerUrl,
    context,
    ecies,
    debug = false,
  }: SocketServiceProps) {
    super();

    this.reconnect = reconnect;
    this.context = context;
    this.communicationLayerPreference = communicationLayerPreference;
    this.debug = debug;
    this.communicationServerUrl = communicationServerUrl;

    const options = {
      autoConnect: false,
      transports: DEFAULT_SOCKET_TRANSPORTS,
    };

    if (transports) {
      options.transports = transports;
    }

    this.socket = io(communicationServerUrl, options);

    const connectAgain = () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', connectAgain);
      }

      if (this.debug) {
        console.debug(
          `SocketService::connectAgain trying to reconnect after socketio disconnection`,
        );
      }
      this.reconnect = true;
      this.socket.connect();
      this.socket.emit(MessageType.JOIN_CHANNEL, this.channelId);
    };

    const checkFocus = () => {
      console.debug(`SocketService::checkFocus`);
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
      }

      if (document.hasFocus()) {
        connectAgain();
      } else {
        window.addEventListener('focus', connectAgain);
      }
    };

    this.socket.on('error', (error) => {
      if (this.debug) {
        console.debug(`SocketService::on 'error' `, error);
      }
      connectAgain();
    });

    this.socket.on('disconnect', (reason) => {
      if (this.debug) {
        console.debug(`SocketService::on 'disconnect' `, reason);
      }

      if (!this.manualDisconnect) {
        checkFocus();
      }
    });

    const keyExchangeInitParameter = {
      communicationLayer: this,
      otherPublicKey,
      sendPublicKey: false,
      context: this.context,
      ecies,
      debug,
    };

    this.keyExchange = new KeyExchange(keyExchangeInitParameter);

    this.keyExchange.on(MessageType.KEY_INFO, (event) => {
      if (this.debug) {
        console.debug(`SocketService::on 'KEY_INFO'`, event);
      }
      this.emit(MessageType.KEY_INFO, event);
    });

    this.keyExchange.on(MessageType.KEYS_EXCHANGED, () => {
      if (this.debug) {
        console.debug(`SocketService::on 'keys_exchanged'`);
      }
      this.emit(MessageType.CLIENTS_READY, {
        isOriginator: this.isOriginator,
      });
      const serviceStatus: ServiceStatus = {
        keyInfo: this.getKeyInfo(),
      };
      this.emit(MessageType.SERVICE_STATUS, serviceStatus);
    });
  }

  resetKeys(): void {
    // this.disconnect();
    if (this.debug) {
      console.debug(`SocketService::resetKeys()`);
    }
    this.keyExchange.resetKeys();
  }

  private checkSameId(id: string) {
    if (id !== this.channelId) {
      if (this.debug) {
        console.error(`Wrong id ${id} - should be ${this.channelId}`);
      }
      throw new Error('Wrong id');
    }
  }

  private setupChannelListeners(channelId: string): void {
    this.socket.on(`clients_connected-${channelId}`, (id: string) => {
      if (this.debug) {
        console.debug(
          `SocketService::${this.context}::setupChannelListener::on 'clients_connected-${channelId}' reconnect=${this.reconnect} isOriginator=${this.isOriginator}`,
          id,
        );
      }
      this.channelId = channelId;
      this.clientsConnected = true;
      if (this.isOriginator) {
        if (!this.keyExchange.areKeysExchanged()) {
          this.keyExchange.start(this.isOriginator);
        }
      }
      if (this.debug) {
        console.debug(
          `SocketService::${this.context}::setupChannelListener reconnect=${
            this.reconnect
          } keysExchanged=${this.keyExchange.areKeysExchanged()} isOriginator=${
            this.isOriginator
          }`,
        );
      }

      // Is it a reconnection?
      if (this.reconnect) {
        if (this.keyExchange.areKeysExchanged()) {
          if (this.debug) {
            console.debug(
              `SocketService::${this.context}::setupChannelListener sendMessage({type: READY})`,
            );
          }
          // here is when we resume from MM mobile
          this.sendMessage({ type: MessageType.READY });
          if (
            this.communicationLayerPreference ===
            CommunicationLayerPreference.WEBRTC
          ) {
            this.emit(MessageType.CLIENTS_READY, {
              isOriginator: this.isOriginator,
              context: this.context,
            });
          }
        } else if (!this.isOriginator) {
          if (this.debug) {
            console.debug(
              `SocketService::${this.context}::setupChannelListener sendMessage({type: KEY_HANDSHAKE_START})`,
            );
          }

          this.sendMessage({
            type: MessageType.KEY_HANDSHAKE_START,
          });
        }
        // reconnect switched when connection resume.
        this.reconnect = false;
      }
    });

    this.socket.on(`channel_created-${channelId}`, (id) => {
      if (this.debug) {
        console.debug(
          `SocketService::${this.context}::setupChannelListener::on 'channel_created-${channelId}'`,
          id,
        );
      }
      this.emit(MessageType.CHANNEL_CREATED, id);
    });

    this.socket.on(`clients_disconnected-${channelId}`, () => {
      this.clientsConnected = false;
      // FIXME reset key exchange after each disconnection, is it correct?
      if (!this.isOriginator) {
        this.keyExchange.clean();
      }
      this.emit(MessageType.CLIENTS_DISCONNECTED, channelId);
    });

    this.socket.on(`message-${channelId}`, ({ id, message, error }) => {
      if (this.debug) {
        console.debug(
          `SocketService::${
            this.context
          }::setupChannelListener::on 'message-${channelId}' error=${error} keysExchanged=${this.keyExchange.areKeysExchanged()}`,
          message,
        );
      }

      if (error) {
        throw new Error(error);
      }

      this.checkSameId(id);

      if (
        this.isOriginator &&
        this.keyExchange.areKeysExchanged() &&
        message?.type === MessageType.KEY_HANDSHAKE_START
      ) {
        if (this.debug) {
          console.debug(
            `SocketService::${this.context}::setupChannelListener received HANDSHAKE_START isOriginator=${this.isOriginator}`,
            message,
          );
        }

        return this.keyExchange.start(this.isOriginator);
      }

      if (this.debug) {
        // Special case to manage resetting key exchange when keys are already exchanged
        console.debug(
          `originator=${this.isOriginator}, type=${
            message?.type
          }, keysExchanged=${this.keyExchange.areKeysExchanged()}, ${
            message?.type === MessageType.KEY_HANDSHAKE_SYN
          }, ${message?.type === MessageType.KEY_HANDSHAKE_SYN.toString()}`,
        );
      }
      if (
        !this.isOriginator &&
        message?.type === MessageType.KEY_HANDSHAKE_SYN
      ) {
        if (this.debug) {
          console.debug(
            `SocketService::${this.context}::setupChannelListener received HANDSHAKE_SYN isOriginator=${this.isOriginator} --> emit KEY_EXCHANGE`,
          );
        }
        // dapp is sending SYN trying to re-initialize the key exchange, respond with KEY_EXCHANGE
        // update dapp public key
        if (message?.pubkey) {
          this.keyExchange.setOtherPublicKey(message.pubkey);
        }

        return this.emit(MessageType.KEY_EXCHANGE, {
          message,
          context: this.context,
        });
      }

      if (!this.keyExchange.areKeysExchanged()) {
        if (message?.type?.startsWith('key_handshake')) {
          if (this.debug) {
            console.debug(
              `SocketService::${this.context}::setupChannelListener emit KEY_EXCHANGE`,
              message,
            );
          }
          return this.emit(MessageType.KEY_EXCHANGE, {
            message,
            context: this.context,
          });
        }
        throw new Error('Keys not exchanged');
      }

      const decryptedMessage = this.keyExchange.decryptMessage(message);
      const messageReceived = JSON.parse(decryptedMessage);
      return this.emit(MessageType.MESSAGE, { message: messageReceived });
    });

    this.socket.on(
      `clients_waiting_to_join-${channelId}`,
      (numberUsers: number) => {
        if (this.debug) {
          console.debug(
            `SocketService::${this.context}::setupChannelListener::on 'clients_waiting_to_join-${channelId}'`,
            numberUsers,
          );
        }
        this.emit(MessageType.CLIENTS_WAITING, numberUsers);
      },
    );
  }

  createChannel(): Channel {
    if (this.debug) {
      console.debug(`SocketService::${this.context}::createChannel()`);
    }
    this.manualDisconnect = false;
    this.socket.connect();
    this.isOriginator = true;
    const channelId = uuidv4();
    this.setupChannelListeners(channelId);
    this.socket.emit(MessageType.JOIN_CHANNEL, channelId);
    return { channelId, pubKey: this.keyExchange.getMyPublicKey() };
  }

  connectToChannel({
    channelId,
    isOriginator = false,
  }: ConnectToChannelOptions): void {
    if (this.debug) {
      console.debug(
        `SocketService::${this.context}::connectToChannel() channelId=${channelId} isOriginator=${isOriginator}`,
        this.keyExchange.toString(),
      );
    }
    this.manualDisconnect = false;
    this.socket.connect();
    this.isOriginator = isOriginator;
    if (isOriginator) {
      // The following is to enable session persistence, public key needs to be resent
      // this.keyExchange.clean();
      this.keyExchange.setSendPublicKey(true);
    }
    this.channelId = channelId;
    this.setupChannelListeners(channelId);
    this.socket.emit(MessageType.JOIN_CHANNEL, channelId);
  }

  getKeyInfo(): KeyInfo {
    return this.keyExchange.getKeyInfo();
  }

  sendMessage(message: CommunicationLayerMessage): void {
    if (!this.channelId) {
      throw new Error('Create a channel first');
    }

    if (this.debug) {
      console.debug(
        `SocketService::${
          this.context
        }::sendMessage() areKeysExchanged=${this.keyExchange.areKeysExchanged()}`,
        message,
      );
    }
    if (!this.keyExchange.areKeysExchanged()) {
      if (message?.type?.startsWith('key_handshake')) {
        if (this.debug) {
          console.debug(
            `SocketService::${this.context}::sendMessage()`,
            message,
          );
        }
        this.socket.emit(MessageType.MESSAGE, {
          id: this.channelId,
          context: this.context,
          message,
        });
        return;
      }

      if (this.debug) {
        console.debug(
          `SocketService::${this.context}::sendMessage() ERROR keys not exchanged`,
          message,
        );
      }
      throw new Error('Keys not exchanged');
    }

    const encryptedMessage = this.keyExchange.encryptMessage(
      JSON.stringify(message),
    );

    const messageToSend = {
      id: this.channelId,
      context: this.context,
      message: encryptedMessage,
    };
    if (this.debug) {
      console.debug(
        `SocketService::${this.context}::sendMessage()`,
        messageToSend,
      );
    }

    // special case handling for manual disconnect (TERMINATE message)
    if (message.type === MessageType.TERMINATE) {
      this.manualDisconnect = true;
    }
    this.socket.emit(MessageType.MESSAGE, messageToSend);
  }

  pause(): void {
    if (this.debug) {
      console.debug(`SocketService::${this.context}::pause()`);
    }
    this.manualDisconnect = true;
    if (this.keyExchange.areKeysExchanged()) {
      this.sendMessage({ type: MessageType.PAUSE });
    }
    this.socket.disconnect();
  }

  isConnected() {
    return this.socket.connected;
  }

  resume(): void {
    if (this.debug) {
      console.debug(`SocketService::${this.context}::resume()`);
    }
    this.manualDisconnect = false;
    if (this.keyExchange.areKeysExchanged()) {
      this.reconnect = true;
      this.socket.connect();
      this.socket.emit(MessageType.JOIN_CHANNEL, this.channelId);
    }
  }

  disconnect(options?: DisconnectOptions): void {
    if (this.debug) {
      console.debug(`SocketService::${this.context}::disconnect()`, options);
    }
    if (options?.terminate && this.keyExchange.areKeysExchanged()) {
      this.sendMessage({ type: MessageType.TERMINATE });
    }
    this.manualDisconnect = true;
    this.socket.disconnect();
    this.socket.close();
  }
}
