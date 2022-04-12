import { EventEmitter2 } from 'eventemitter2';
import io from 'socket.io-client';
import KeyExchange from './KeyExchange';

export default class Socket extends EventEmitter2 {
  socket = null;

  clientsConnected = false;

  clientsReady = false;

  isOriginator;

  channelId = null;

  keyExchange: KeyExchange;

  constructor() {
    super();

    this.socket = io('https://lizard-positive-office.glitch.me/');

    this.keyExchange = new KeyExchange({ commLayer: this });

    this.keyExchange.on('keys_exchanged', () => {
      this.emit('clients_ready', {
        isOriginator: this.isOriginator,
      });
    });

    this.socket.on('clients_connected', (id) => {
      this.channelId = id;
      this.clientsConnected = true;
      if (this.isOriginator) {
        this.keyExchange.start();
      }
    });

    this.socket.on('channel_created', (id) => {
      this.emit('channel_created', id);
    });

    this.socket.on('message', ({ id, message, error }) => {
      if (error) {
        throw new Error(error);
      }

      this.checkSameId(id);

      if (!this.keyExchange.keysExchanged) {
        const messageReceived = message;
        if (messageReceived?.type.startsWith('key_handshake')) {
          return this.emit('key_exchange', { message: messageReceived });
        }
        throw new Error('Keys not exchanged');
      }

      const decryptedMessage = this.keyExchange.decryptMessage(message);
      const messageReceived = JSON.parse(decryptedMessage);
      return this.emit('message', { message: messageReceived });
    });

    this.socket.on('clients_disconnected', () => {
      this.emit('clients_disconnected');
    });
  }

  checkSameId(id) {
    if (id !== this.channelId) {
      throw new Error('Wrong id');
    }
  }

  send(type, message) {
    this.socket.emit(type, message);
  }

  sendMessage(message) {
    if (!this.channelId) {
      throw new Error('Create a channel first');
    }
    if (!this.keyExchange.keysExchanged) {
      if (message?.type.startsWith('key_handshake')) {
        return this.socket.emit('message', { id: this.channelId, message });
      }
      throw new Error('Keys not exchanged');
    }

    const encryptedMessage = this.keyExchange.encryptMessage(
      JSON.stringify(message),
    );

    return this.socket.emit('message', {
      id: this.channelId,
      message: encryptedMessage,
    });
  }

  connectToChannel(id) {
    this.channelId = id;
    this.socket.emit('join_channel', id);
  }

  createChannel(id) {
    this.isOriginator = true;
    if (!id) {
      throw new Error('Id must exist');
    }
    this.socket.emit('join_channel', id);
  }
}
