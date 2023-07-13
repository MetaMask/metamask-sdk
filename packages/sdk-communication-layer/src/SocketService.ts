/* eslint-disable padding-line-between-statements */
import { EventEmitter2 } from 'eventemitter2';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_SERVER_URL, DEFAULT_SOCKET_TRANSPORTS } from './config';
import { ECIESProps } from './ECIES';
import { KeyExchange } from './KeyExchange';
import { Channel } from './types/Channel';
import { CommunicationLayer } from './types/CommunicationLayer';
import { CommunicationLayerMessage } from './types/CommunicationLayerMessage';
import { CommunicationLayerPreference } from './types/CommunicationLayerPreference';
import { ConnectToChannelOptions } from './types/ConnectToChannelOptions';
import { DisconnectOptions } from './types/DisconnectOptions';
import { EventType } from './types/EventType';
import { InternalEventType } from './types/InternalEventType';
import { KeyExchangeMessageType } from './types/KeyExchangeMessageType';
import { KeyInfo } from './types/KeyInfo';
import { CommunicationLayerLoggingOptions } from './types/LoggingOptions';
import { MessageType } from './types/MessageType';
import { ServiceStatus } from './types/ServiceStatus';
import { wait, waitForRpc } from './utils/wait';

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

export interface RPCMethodResult {
  timestamp: number; // timestamp of last request
  method: string;
  result?: unknown;
  elapsedTime?: number; // elapsed time between request and response
}
export interface RPCMethodCache {
  [id: string]: RPCMethodResult;
}

export class SocketService extends EventEmitter2 implements CommunicationLayer {
  private socket: Socket;

  private clientsConnected = false;

  /**
   * Special flag used to session persistence in case MetaMask disconnects without Pause,
   * it means we need to re-create a new key handshake.
   */
  private clientsPaused = false;

  private isOriginator?: boolean;

  private channelId?: string;

  private keyExchange: KeyExchange;

  private manualDisconnect = false;

  private resumed?: boolean;

  private communicationLayerPreference: CommunicationLayerPreference;

  private context: string;

  private withKeyExchange?: boolean;

  private communicationServerUrl: string;

  private debug: boolean;

  private rpcMethodTracker: RPCMethodCache = {};

  private hasPlaintext = false;

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

    this.resumed = reconnect;
    this.context = context;
    this.communicationLayerPreference = communicationLayerPreference;
    this.debug = logging?.serviceLayer === true;
    this.communicationServerUrl = communicationServerUrl;
    this.hasPlaintext =
      this.communicationServerUrl !== DEFAULT_SERVER_URL &&
      logging?.plaintext === true;

    const options = {
      autoConnect: false,
      transports: DEFAULT_SOCKET_TRANSPORTS,
    };

    if (transports) {
      options.transports = transports;
    }

    if (this.debug) {
      console.debug(
        `SocketService::constructor() Socket IO url: ${this.communicationServerUrl}`,
      );
    }

    this.socket = io(communicationServerUrl, options);

    const keyExchangeInitParameter = {
      communicationLayer: this,
      otherPublicKey,
      sendPublicKey: false,
      context: this.context,
      ecies,
      logging,
    };

    this.keyExchange = new KeyExchange(keyExchangeInitParameter);
  }

  resetKeys(): void {
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
    if (this.debug) {
      console.debug(
        `SocketService::${this.context}::setupChannelListener setting socket listeners for channel ${channelId}...`,
      );
    }

    const connectAgain = async () => {
      if (this.debug) {
        console.debug(
          `SocketService::connectAgain this.socket.connected=${this.socket.connected} trying to reconnect after socketio disconnection`,
          this,
        );
      }

      // Add delay to prevent IOS error
      // https://stackoverflow.com/questions/53297188/afnetworking-error-53-during-attempted-background-fetch
      await wait(200);

      if (!this.socket.connected) {
        this.resumed = true;
        this.socket.connect();

        this.emit(EventType.SOCKET_RECONNECT);
        this.socket.emit(
          EventType.JOIN_CHANNEL,
          this.channelId,
          `${this.context}connect_again`,
        );
      }
    };

    const checkFocus = () => {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
      }

      if (this.debug) {
        console.debug(
          `SocketService::checkFocus hasFocus=${document.hasFocus()}`,
          this,
        );
      }

      if (document.hasFocus()) {
        connectAgain.call(this).catch((err) => {
          console.error(
            `SocketService::checkFocus Error reconnecting socket`,
            err,
          );
        });
      } else {
        window.addEventListener('focus', connectAgain.bind(this), {
          once: true,
        });
      }
    };

    this.socket.on('error', (error) => {
      if (this.debug) {
        console.debug(`SocketService::on 'error' `, error);
      }
      checkFocus();
    });

    this.socket.on('ping', () => {
      if (this.debug) {
        console.debug(`SocketService::on 'ping'`);
      }
    });

    this.socket.on('reconnect', (attempt) => {
      if (this.debug) {
        console.debug(`SocketService::on 'reconnect' attempt=${attempt}`);
      }
    });

    this.socket.on('reconnect_error', (error) => {
      if (this.debug) {
        console.debug(`SocketService::on 'reconnect_error'`, error);
      }
    });

    this.socket.on('reconnect_failed', () => {
      if (this.debug) {
        console.debug(`SocketService::on 'reconnect_failed'`);
      }
    });

    this.socket.on('disconnect', (reason) => {
      if (this.debug) {
        console.debug(
          `SocketService::on 'disconnect' manualDisconnect=${this.manualDisconnect}`,
          reason,
        );
      }

      if (!this.manualDisconnect) {
        /**
         * Used for web in case of socket io disconnection.
         * Always try to recover the connection.
         *
         * 'disconnect' event also happens on RN after app is in background for ~30seconds.
         * The reason is will be 'transport error'.
         * This creates an issue that the user needs to reply a provider query within 30 seconds.
         *
         * FIXME: is there a way to address a slow (>30s) provider query reply.
         */
        this.emit(EventType.SOCKET_DISCONNECTED);
        checkFocus.call(this);
      }
    });

    this.socket.on(`clients_connected-${channelId}`, async (_id: string) => {
      if (this.debug) {
        console.debug(
          `SocketService::${
            this.context
          }::setupChannelListener::on 'clients_connected-${channelId}'  resumed=${
            this.resumed
          }  clientsPaused=${
            this.clientsPaused
          } keysExchanged=${this.keyExchange.areKeysExchanged()} isOriginator=${
            this.isOriginator
          }`,
        );
      }

      // Inform other layer of clients reconnection
      this.emit(EventType.CLIENTS_CONNECTED, {
        isOriginator: this.isOriginator,
        keysExchanged: this.keyExchange.areKeysExchanged(),
        context: this.context,
      });

      if (this.resumed) {
        if (this.keyExchange.areKeysExchanged()) {
          if (this.debug) {
            console.debug(
              `SocketService::${this.context}::on 'clients_connected' reconnect=true keysExchanged=false`,
            );
          }
          if (
            this.communicationLayerPreference ===
            CommunicationLayerPreference.WEBRTC
          ) {
            this.emit(EventType.CLIENTS_READY, {
              isOriginator: this.isOriginator,
              keysExchanged: this.keyExchange.areKeysExchanged(),
              context: this.context,
            });
          }
        } else if (!this.isOriginator) {
          // should ask to redo a key exchange because it wasn't paused.
          if (this.debug) {
            console.debug(
              `SocketService::${
                this.context
              }::on 'clients_connected' / keysExchanged=${this.keyExchange.areKeysExchanged()} -- backward compatibility`,
            );
          }

          this.keyExchange.start({
            isOriginator: this.isOriginator ?? false,
          });
        }
        // resumed switched when connection resume.
        this.resumed = false;
      } else if (this.clientsPaused) {
        console.debug(
          `SocketService::on 'clients_connected' skip sending originatorInfo on pause`,
        );
      } else if (!this.isOriginator) {
        // Reconnect scenario --- maybe web dapp got refreshed
        if (this.debug) {
          console.debug(
            `SocketService::${
              this.context
            }::on 'clients_connected' / keysExchanged=${this.keyExchange.areKeysExchanged()} -- backward compatibility`,
          );
        }

        // Add delay in case exchange was already initiated by dapp.
        // Always request key exchange from wallet since it looks like a reconnection.
        this.keyExchange.start({
          isOriginator: this.isOriginator ?? false,
          force: true,
        });
      }

      this.clientsConnected = true;
      this.clientsPaused = false;
    });

    this.socket.on(`channel_created-${channelId}`, (id) => {
      if (this.debug) {
        console.debug(
          `SocketService::${this.context}::setupChannelListener::on 'channel_created-${channelId}'`,
          id,
        );
      }
      this.emit(EventType.CHANNEL_CREATED, id);
    });

    this.socket.on(`clients_disconnected-${channelId}`, () => {
      this.clientsConnected = false;
      if (this.debug) {
        console.debug(
          `SocketService::${this.context}::setupChannelListener::on 'clients_disconnected-${channelId}'`,
        );
      }
      if (this.isOriginator && !this.clientsPaused) {
        // If it wasn't paused - need to reset keys.
        this.keyExchange.clean();
      }

      this.emit(EventType.CLIENTS_DISCONNECTED, channelId);
    });

    this.socket.on(`message-${channelId}`, ({ id, message, error }) => {
      if (this.debug) {
        console.debug(
          `SocketService::${
            this.context
          }::on 'message' ${channelId} keysExchanged=${this.keyExchange.areKeysExchanged()}`,
          message,
        );
      }

      if (error) {
        if (this.debug) {
          console.debug(`
          SocketService::${this.context}::on 'message' error=${error}`);
        }

        throw new Error(error);
      }

      try {
        this.checkSameId(id);
      } catch (err) {
        console.error(`ignore message --- wrong id `, message);
        return;
      }

      if (
        this.isOriginator &&
        message?.type === KeyExchangeMessageType.KEY_HANDSHAKE_START
      ) {
        if (this.debug) {
          console.debug(
            `SocketService::${this.context}::on 'message' received HANDSHAKE_START isOriginator=${this.isOriginator}`,
            message,
          );
        }

        this.keyExchange.start({
          isOriginator: this.isOriginator ?? false,
          force: true,
        });
        return;
      }

      // TODO can be removed once session persistence fully vetted.
      if (message?.type === MessageType.PING) {
        if (this.debug) {
          console.debug(`SocketService::${this.context}::on 'message' ping `);
        }

        this.emit(EventType.MESSAGE, { message: { type: 'ping' } });
        return;
      }

      if (this.debug) {
        // Special case to manage resetting key exchange when keys are already exchanged
        console.debug(
          `SocketService::${this.context}::on 'message' originator=${
            this.isOriginator
          }, type=${
            message?.type
          }, keysExchanged=${this.keyExchange.areKeysExchanged()}`,
        );
      }

      if (message?.type?.startsWith('key_handshake')) {
        if (this.debug) {
          console.debug(
            `SocketService::${this.context}::on 'message' emit KEY_EXCHANGE`,
            message,
          );
        }

        this.emit(InternalEventType.KEY_EXCHANGE, {
          message,
          context: this.context,
        });
        return;
      }

      if (!this.keyExchange.areKeysExchanged()) {
        // received encrypted message before keys were exchanged.
        if (this.isOriginator) {
          this.keyExchange.start({ isOriginator: this.isOriginator ?? false });
        } else {
          // Request new key exchange
          this.sendMessage({
            type: KeyExchangeMessageType.KEY_HANDSHAKE_START,
          });
        }
        //  ignore message and wait for completion.
        console.warn(
          `Message ignored because invalid key exchange status`,
          message,
        );
        return;
      } else if (message.toString().indexOf('type') !== -1) {
        // Even if keys were exchanged, if the message is not encrypted, emit it.
        // *** This is not supposed to happen ***
        console.warn(
          `SocketService::on 'message' received non encrypted unkwown message`,
        );
        this.emit(EventType.MESSAGE, message);
        return;
      }

      const decryptedMessage = this.keyExchange.decryptMessage(message);
      const messageReceived = JSON.parse(decryptedMessage);

      if (messageReceived?.type === MessageType.PAUSE) {
        /**
         * CommunicationLayer shouldn't be aware of the protocol details but we make an exception to manager session persistence.
         * Receiving pause is the correct way to quit MetaMask app,
         * but in case it is killed we won't receive a PAUSE signal and thus need to re-create the handshake.
         */
        this.clientsPaused = true;
      } else {
        this.clientsPaused = false;
      }

      if (this.isOriginator && messageReceived.data) {
        // inform cache from result
        const rpcMessage = messageReceived.data as {
          id: string;
          result: unknown;
        };
        const initialRPCMethod = this.rpcMethodTracker[rpcMessage.id];
        if (initialRPCMethod) {
          const elapsedTime = Date.now() - initialRPCMethod.timestamp;
          if (this.debug) {
            console.debug(
              `SocketService::${this.context}::on 'message' received answer for id=${rpcMessage.id} method=${initialRPCMethod.method} responseTime=${elapsedTime}`,
              messageReceived,
            );
          }
          const rpcResult = {
            ...initialRPCMethod,
            result: rpcMessage.result,
            elapsedTime,
          };
          this.rpcMethodTracker[rpcMessage.id] = rpcResult;

          if (this.debug) {
            console.debug(`HACK update rpcMethodTracker`, rpcResult);
          }
          // FIXME hack while waiting for mobile release 7.3
          this.emit(EventType.AUTHORIZED);
        }
      }

      this.emit(EventType.MESSAGE, { message: messageReceived });
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
        this.emit(EventType.CLIENTS_WAITING, numberUsers);
      },
    );

    this.keyExchange.on(EventType.KEY_INFO, (event) => {
      if (this.debug) {
        console.debug(`SocketService::on 'KEY_INFO'`, event);
      }
      this.emit(EventType.KEY_INFO, event);
    });

    this.keyExchange.on(EventType.KEYS_EXCHANGED, () => {
      if (this.debug) {
        console.debug(
          `SocketService::on 'keys_exchanged' keyschanged=${this.keyExchange.areKeysExchanged()}`,
        );
      }
      // Propagate key exchange event
      this.emit(EventType.KEYS_EXCHANGED, {
        keysExchanged: this.keyExchange.areKeysExchanged(),
        isOriginator: this.isOriginator,
      });
      const serviceStatus: ServiceStatus = {
        keyInfo: this.getKeyInfo(),
      };
      this.emit(EventType.SERVICE_STATUS, serviceStatus);
    });
  }

  createChannel(): Channel {
    if (this.debug) {
      console.debug(`SocketService::${this.context}::createChannel()`);
    }

    if (!this.socket.connected) {
      this.socket.connect();
    }

    this.manualDisconnect = false;
    this.isOriginator = true;
    const channelId = uuidv4();
    this.channelId = channelId;
    this.setupChannelListeners(channelId);
    this.socket.emit(
      EventType.JOIN_CHANNEL,
      channelId,
      `${this.context}createChannel`,
    );
    return { channelId, pubKey: this.keyExchange.getMyPublicKey() };
  }

  connectToChannel({
    channelId,
    isOriginator = false,
    withKeyExchange = false,
  }: ConnectToChannelOptions): void {
    if (this.debug) {
      console.debug(
        `SocketService::${this.context}::connectToChannel() channelId=${channelId} isOriginator=${isOriginator}`,
        this.keyExchange.toString(),
      );
    }

    if (this.socket.connected) {
      throw new Error(`socket already connected`);
    }

    this.manualDisconnect = false;
    this.socket.connect();
    this.withKeyExchange = withKeyExchange;
    this.isOriginator = isOriginator;
    this.channelId = channelId;
    this.setupChannelListeners(channelId);
    this.socket.emit(
      EventType.JOIN_CHANNEL,
      channelId,
      `${this.context}_connectToChannel`,
    );
  }

  getKeyInfo(): KeyInfo {
    return this.keyExchange.getKeyInfo();
  }

  keyCheck() {
    this.socket.emit(EventType.MESSAGE, {
      id: this.channelId,
      context: this.context,
      message: {
        type: KeyExchangeMessageType.KEY_HANDSHAKE_CHECK,
        pubkey: this.getKeyInfo().ecies.otherPubKey,
      },
    });
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

    if (message?.type?.startsWith('key_handshake')) {
      // Don't encrypt key_handshake message even if keys were previously exchanged.
      // The state on the other party may be inconsistent so we need to re-do the key exhange in clear text.
      if (this.debug) {
        console.debug(`SocketService::${this.context}::sendMessage()`, message);
      }
      this.socket.emit(EventType.MESSAGE, {
        id: this.channelId,
        context: this.context,
        message,
      });
      return;
    }

    if (!this.keyExchange.areKeysExchanged()) {
      if (this.debug) {
        console.debug(
          `SocketService::${this.context}::sendMessage() ERROR keys not exchanged`,
          message,
        );
      }
      throw new Error('Keys not exchanged BBB');
    }

    // TODO Prevent sending same method multiple time which can sometime happen during initialization
    const method = message?.method ?? '';
    const rpcId = message?.id;
    if (this.isOriginator && rpcId) {
      // use cache if method is re-sent within 10sec.
      this.rpcMethodTracker[rpcId] = {
        timestamp: Date.now(),
        method,
      };
    }

    const encryptedMessage = this.keyExchange.encryptMessage(
      JSON.stringify(message),
    );

    const messageToSend = {
      id: this.channelId,
      context: this.context,
      message: encryptedMessage,
      // plaintext is only enabled when using custom socket server in dev.
      plaintext: this.hasPlaintext ? JSON.stringify(message) : undefined,
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
    this.socket.emit(EventType.MESSAGE, messageToSend);

    // Only makes sense on originator side.
    // wait for reply when eth_requestAccounts is sent.
    if (this.isOriginator && rpcId) {
      waitForRpc(rpcId, this.rpcMethodTracker, 200)
        .then((result) => {
          if (this.debug) {
            console.debug(
              `SocketService::waitForRpc id=${rpcId} ${method} ( ${result.elapsedTime} ms)`,
              result.result,
            );
          }
        })
        .catch((err) => {
          console.warn(`Error rpcId=${rpcId} ${method}`, err);
        });
    }
  }

  ping() {
    if (this.debug) {
      console.debug(
        `SocketService::${
          this.context
        }::ping() keysExchanged=${this.keyExchange.areKeysExchanged()}`,
      );
    }

    if (!this.isOriginator) {
      if (this.keyExchange.areKeysExchanged()) {
        this.sendMessage({ type: MessageType.READY });
      } else {
        this.keyExchange.start({ isOriginator: this.isOriginator ?? false });
      }
    }

    this.socket.emit(EventType.MESSAGE, {
      id: this.channelId,
      context: this.context,
      message: {
        type: MessageType.PING,
      },
    });
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
      console.debug(
        `SocketService::${this.context}::resume() connected=${
          this.socket.connected
        } manualDisconnect=${this.manualDisconnect} resumed=${
          this.resumed
        } keysExchanged=${this.keyExchange.areKeysExchanged()}`,
      );
    }

    if (this.socket.connected) {
      if (this.debug) {
        console.debug(`SocketService::resume() already connected.`);
      }
    } else {
      this.socket.connect();
      if (this.debug) {
        console.debug(
          `SocketService::resume() after connecting socket --> connected=${this.socket.connected}`,
        );
      }
      // Useful to re-emmit otherwise dapp might sometime loose track of the connection event.
      this.socket.emit(
        EventType.JOIN_CHANNEL,
        this.channelId,
        `${this.context}_resume`,
      );
    }

    // Always try to recover key exchange from both side (wallet / dapp)
    if (this.keyExchange.areKeysExchanged()) {
      if (!this.isOriginator) {
        this.sendMessage({ type: MessageType.READY });
      }
    } else if (!this.isOriginator) {
      // Ask to start key exchange
      this.keyExchange.start({ isOriginator: this.isOriginator ?? false });
    }

    this.manualDisconnect = false;
    this.resumed = true;
  }

  disconnect(options?: DisconnectOptions): void {
    if (this.debug) {
      console.debug(`SocketService::${this.context}::disconnect()`, options);
    }
    if (options?.terminate) {
      this.channelId = options.channelId;
      this.keyExchange.clean();
    }
    // Reset rpcMethodTracker
    this.rpcMethodTracker = {};
    this.manualDisconnect = true;
    this.socket.disconnect();
  }
}
