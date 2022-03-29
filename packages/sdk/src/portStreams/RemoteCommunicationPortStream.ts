import { Duplex } from 'stream';
import { Buffer } from 'buffer';
import WalletConnect from '../services/WalletConnect';
import RemoteCommunication from '../services/RemoteCommunication';
import WebRTC from '../services/RemoteCommunication/WebRTC';

const comm = new RemoteCommunication({ CommLayer: WebRTC });
console.log(comm);
comm.generateChannelId();
comm.on('channel_created', (channel) =>
  console.log('CHANNEL CREATED', channel),
);
const noop = () => undefined;

/**
 * Creates a stream that's both readable and writable.
 * The stream supports arbitrary objects.
 *
 * @class
 * @param {Object} port Remote Port object
 */
class RemoteCommunicationPortStream extends Duplex {
  _name: any;

  _targetWindow: Window & typeof globalThis;

  _port: any;

  _origin: string;

  _onMessage: any;

  _onDisconnect: () => void;

  comm: any;

  private _alreadySubscribed: boolean;

  constructor(port) {
    super();
    Duplex.call(this, {
      objectMode: true,
    });
    this._name = port.name;
    this._targetWindow = window;
    this._port = port;
    this._origin = location.origin;
    this._alreadySubscribed = false;
    window.addEventListener('message', this._onMessage.bind(this), false);
    // this.comm = new RemoteCommunication({ CommLayer: WebRTC });
  }
}

/**
 * Callback triggered when a message is received from
 * the remote Port associated with this Stream.
 *
 * @private
 * @param {Object} msg - Payload from the onMessage listener of Port
 */
RemoteCommunicationPortStream.prototype._onMessage = function (event) {
  const msg = event.data;
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
RemoteCommunicationPortStream.prototype._onDisconnect = function () {
  this.destroy();
};

/**
 * Explicitly sets read operations to a no-op
 */
RemoteCommunicationPortStream.prototype._read = noop;

/**
 * Called internally when data should be written to
 * this writable stream.
 *
 * @private
 * @param {*} msg Arbitrary object to write
 * @param {string} encoding Encoding to use when writing payload
 * @param {Function} cb Called when writing is complete or an error occurs
 */
RemoteCommunicationPortStream.prototype._write = function (msg, _encoding, cb) {
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

    /* RemoteCommunication.sendMessage(data?.data)
      .then((result) => {
        const res = {
          data: {
            name: ProviderConstants.PROVIDER,
            data: {
              id: data.data.id,
              jsonrpc: '2.0',
              result,
            },
          },
          target: ProviderConstants.INPAGE,
        };

        // Returns request result
        this._onMessage(res);
      })
      .catch((error) => {
        // Error returned when rejected
        const res = {
          data: {
            name: ProviderConstants.PROVIDER,
            data: {
              id: data.data.id,
              jsonrpc: '2.0',
              error: error.toString(),
            },
          },
          target: ProviderConstants.INPAGE,
        };*/

    // Returns request result
    // this._onMessage(res);
    //  });

    const METHODS_TO_REDIRECT = {
      eth_requestAccounts: false,
      eth_sendTransaction: true,
      eth_signTransaction: true,
      eth_sign: true,
      personal_sign: true,
      eth_signTypedData: true,
      eth_signTypedData_v3: true,
      eth_signTypedData_v4: true,
      wallet_watchAsset: true,
      wallet_addEthereumChain: true,
      wallet_switchEthereumChain: true,
    };

    // Check if should open app
    if (METHODS_TO_REDIRECT[data?.data?.method] && !WalletConnect.isDesktop) {
      window.open('https://metamask.app.link/', '_self');
    }
  } catch (err) {
    return cb(new Error('RemoteCommunicationPortStream - disconnected'));
  }
  return cb();
};

export default RemoteCommunicationPortStream;
