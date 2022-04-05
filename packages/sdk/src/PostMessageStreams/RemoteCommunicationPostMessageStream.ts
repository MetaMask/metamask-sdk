import { Duplex } from 'stream';
import { Buffer } from 'buffer';
import { METHODS_TO_REDIRECT, ProviderConstants } from '../constants';
import Ethereum from '../services/Ethereum';
import RemoteCommunication from '../services/RemoteCommunication';
import RemoteConnection from '../services/RemoteConnection';
import Platform, { PlatformName } from '../Platform';

class RemoteCommunicationPostMessageStream extends Duplex {
  private _name: any;
  comm: RemoteCommunication;

  constructor({ name }) {
    super({
      objectMode: true,
    });
    this._name = name;

    this.comm = RemoteConnection.getConnector();

    this._onMessage = this._onMessage.bind(this);
    this.comm.on('message', this._onMessage);

    this.comm.on('channel_created', (id) => {
      console.log('channel id', id);
    });

    this.comm.on('clients_ready', () => {
      Ethereum.ethereum._initializeState();
    });
  }

  _write(msg, _encoding, callback) {
    if (!RemoteConnection.isConnected()) return callback();

    try {
      let data;
      if (Buffer.isBuffer(msg)) {
        data = msg.toJSON();
        // @ts-ignore
        data._isBuffer = true;
      } else {
        data = msg;
      }

      this.comm.sendMessage(data?.data);

      const isDesktop = Platform.getPlatform() === PlatformName.DesktopWeb;

      // Check if should open app
      if (METHODS_TO_REDIRECT[data?.data?.method] && !isDesktop) {
        Platform.openLink('https://metamask.app.link/', '_self');
      }
    } catch (err) {
      return callback(
        new Error('RemoteCommunicationPostMessageStream - disconnected'),
      );
    }

    return callback();
  }

  _read() {
    return undefined;
  }

  _onMessage({ message }) {
    // validate message
    /* if (this._origin !== '*' && event.origin !== this._origin) {
      return;
    }*/

    if (!message || typeof message !== 'object') {
      return;
    }
    if (!message.data || typeof message.data !== 'object') {
      return;
    }

    if (message.name && message.name !== ProviderConstants.PROVIDER) {
      return;
    }

    if (Buffer.isBuffer(message)) {
      // @ts-ignore
      delete msg._isBuffer;
      const data = Buffer.from(message);
      this.push(data);
    } else {
      this.push(message);
    }
  }

  start() {
    //Ethereum.ethereum.isConnected = () => RemoteConnection.isConnected();
  }
}

export default RemoteCommunicationPostMessageStream;
