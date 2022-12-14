import { Duplex } from 'stream';
import { Buffer } from 'buffer';

const noop = () => undefined;

/**
 * Creates a stream that's both readable and writable.
 * The stream supports arbitrary objects.
 *
 * @class
 * @param {Object} port Remote Port object
 */
export class MobilePortStream extends Duplex {
  _name: any;

  _targetWindow: Window & typeof globalThis;

  _port: any;

  _origin: string;

  constructor(port: { name: string }) {
    super();
    Duplex.call(this, {
      objectMode: true,
    });
    this._name = port.name;
    this._targetWindow = window;
    this._port = port;
    this._origin = location.origin;
    window.addEventListener('message', this._onMessage.bind(this), false);
  }

  /**
   * Callback triggered when a message is received from
   * the remote Port associated with this Stream.
   *
   * @private
   * @param {Object} msg - Payload from the onMessage listener of Port
   */
  _onMessage(event: any) {
    const msg = event.data;

    // validate message
    if (this._origin !== '*' && event.origin !== this._origin) {
      return;
    }

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
      // eslint-disable-next-line prettier/prettier, @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete msg._isBuffer;
      const data = Buffer.from(msg);
      this.push(data);
    } else {
      this.push(msg);
    }
  }

  /**
   * Callback triggered when the remote Port
   * associated with this Stream disconnects.
   *
   * @private
   */
  _onDisconnect() {
    this.destroy();
  }

  /**
   * Explicitly sets read operations to a no-op
   */
  _read = noop;

  /**
   * Called internally when data should be written to
   * this writable stream.
   *
   * @private
   * @param {*} chunk Arbitrary object to write
   * @param {string} encoding Encoding to use when writing payload
   * @param {Function} cb Called when writing is complete or an error occurs
   */
  _write(
    chunk: any,
    _encoding: BufferEncoding,
    cb: (error?: Error | null) => void,
  ) {
    try {
      if (Buffer.isBuffer(chunk)) {
        const data: {
          type: 'Buffer';
          data: number[];
          _isBuffer?: boolean;
        } = chunk.toJSON();

        data._isBuffer = true;
        window.ReactNativeWebView?.postMessage(
          JSON.stringify({ ...data, origin: window.location.href }),
        );
      } else {
        if (chunk.data) {
          chunk.data.toNative = true;
        }

        window.ReactNativeWebView?.postMessage(
          JSON.stringify({ ...chunk, origin: window.location.href }),
        );
      }
    } catch (err) {
      return cb(new Error('MobilePortStream - disconnected'));
    }
    return cb();
  }
}
