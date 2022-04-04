import { Duplex } from 'stream';
import { Buffer } from 'buffer';
import { METHODS_TO_REDIRECT, ProviderConstants } from '../constants';
import Ethereum from '../services/Ethereum';
import RemoteCommunication from '../services/RemoteCommunication';
import RemoteConnection from '../services/RemoteConnection';
import Platform, { PlatformName } from '../Platform';

const noop = () => undefined;

/**
 * Creates a stream that's both readable and writable.
 * The stream supports arbitrary objects.
 *
 * @class
 * @param {Object} port Remote Port object
 */
class RemoteCommunicationPostMessageStream extends Duplex {
  _name: any;

  _port: any;

  _origin: string;

  _onMessage: any;

  _onDisconnect: () => void;

  private _alreadySubscribed: boolean;
  comm: RemoteCommunication;

  constructor(port) {
    super();
    Duplex.call(this, {
      objectMode: true,
    });
    this._name = port.name;
    this._port = port;
    this._alreadySubscribed = false;
    console.log('SUBSCRIBING');

    this.comm = RemoteConnection.getConnector();
    console.log('this.comm', this.comm);

    this._onMessage = this._onMessage.bind(this);

    this.comm.on('message', this._onMessage);

    this.comm.on('channel_created', (id) => {
      console.log('channel id', id);
    });

    this.comm.on('clients_ready', () => {
      Ethereum.ethereum.isConnected = () => RemoteConnection.isConnected();
      Ethereum.ethereum._initializeState();
    });
  }

  start() {}
}

/**
 * Callback triggered when a message is received from
 * the remote Port associated with this Stream.
 *
 * @private
 * @param {Object} msg - Payload from the onMessage listener of Port
 */
RemoteCommunicationPostMessageStream.prototype._onMessage = function ({ message }) {
  const msg = message;
  console.log('msg', message, this._name);
  // validate message
  /* if (this._origin !== '*' && event.origin !== this._origin) {
    return;
  }*/
  if (!msg || typeof msg !== 'object') {
    return;
  }
  if (!msg.data || typeof msg.data !== 'object') {
    return;
  }
  if (msg.target && msg.target !== this._name) {
    return;
  }

  // Filter outgoing messages
  if (msg.data.data?.toNative) {
    return;
  }

  if (Buffer.isBuffer(msg)) {
    // @ts-ignore
    delete msg._isBuffer;
    const data = Buffer.from(msg);
    this.push(data);
  } else {
    this.push(msg);
  }
};

/**
 * Callback triggered when the remote Port
 * associated with this Stream disconnects.
 *
 * @private
 */
RemoteCommunicationPostMessageStream.prototype._onDisconnect = function () {
  this.destroy();
};

/**
 * Explicitly sets read operations to a no-op
 */
RemoteCommunicationPostMessageStream.prototype._read = noop;

/**
 * Called internally when data should be written to
 * this writable stream.
 *
 * @private
 * @param {*} msg Arbitrary object to write
 * @param {string} encoding Encoding to use when writing payload
 * @param {Function} cb Called when writing is complete or an error occurs
 */
RemoteCommunicationPostMessageStream.prototype._write = function (msg, _encoding, cb) {
  if(!RemoteConnection.isConnected()) return
  try {
    let data;
    if (Buffer.isBuffer(msg)) {
      data = msg.toJSON();
      // @ts-ignore
      data._isBuffer = true;
    } else {
      if (msg.data) {
        msg.data.toNative = true;
      }
      data = msg;
    }

    try {
      console.log('SEND MSG', data?.data);
      this.comm.sendMessage(data?.data);
    } catch (e) {
      console.log('ERROR', e);
    }

    // Check if should open app
    const isDesktop = Platform.getPlatform() === PlatformName.DesktopWeb;
    if (
      METHODS_TO_REDIRECT[data?.data?.method] &&
      !isDesktop
    ) {
      Platform.openLink('https://metamask.app.link/', '_self');
    }
  } catch (err) {
    return cb(new Error('RemoteCommunicationPostMessageStream - disconnected'));
  }
  return cb();
};

export default RemoteCommunicationPostMessageStream;
