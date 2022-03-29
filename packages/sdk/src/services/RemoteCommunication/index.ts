import { EventEmitter2 } from 'eventemitter2';
import { v4 as uuidv4 } from 'uuid';
import WebRTC from './WebRTC';

export default class RemoteCommunication extends EventEmitter2 {
  commLayer = null;

  channelId = null;

  clientsDisconnected = null;

  constructor({ CommLayer = WebRTC }) {
    super();

    this.commLayer = new CommLayer();

    this.commLayer.on('message', ({ message }) => {
      this.onMessageCommLayer(message);
    });

    this.commLayer.on('clients_ready', ({ isOriginator }) => {
      this.emit('clients_ready', { isOriginator });
    });

    this.commLayer.on('clients_disconnected', () => {
      this.commLayer.removeAllListeners();
      this.clientsDisconnected = true;
      this.emit('clients_disconnected');
    });
  }

  connectToChannel(id) {
    this.commLayer.connectToChannel(id);
  }

  sendMessage(message) {
    this.commLayer.sendMessage(message);
  }

  onMessageCommLayer(message) {
    this.emit('message', { message });
  }

  generateChannelId() {
    this.commLayer.on('channel_created', (id) => {
      this.emit('channel_created', id);
    });
    this.channelId = uuidv4();
    this.commLayer.createChannel(this.channelId);
    return this.channelId;
  }
}
