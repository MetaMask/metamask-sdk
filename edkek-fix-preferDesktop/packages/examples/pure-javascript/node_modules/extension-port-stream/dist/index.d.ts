/// <reference types="node" />
import { Duplex } from 'readable-stream';
import { Runtime } from 'webextension-polyfill';
declare type Log = (data: unknown, out: boolean) => void;
export default class PortDuplexStream extends Duplex {
    private _port;
    private _log;
    /**
     * @param port - An instance of WebExtensions Runtime.Port. See:
     * {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/Port}
     */
    constructor(port: Runtime.Port);
    /**
     * Callback triggered when a message is received from
     * the remote Port associated with this Stream.
     *
     * @param msg - Payload from the onMessage listener of the port
     */
    private _onMessage;
    /**
     * Callback triggered when the remote Port associated with this Stream
     * disconnects.
     */
    private _onDisconnect;
    /**
     * Explicitly sets read operations to a no-op.
     */
    _read(): void;
    /**
     * Called internally when data should be written to this writable stream.
     *
     * @param msg - Arbitrary object to write
     * @param encoding - Encoding to use when writing payload
     * @param cb - Called when writing is complete or an error occurs
     */
    _write(msg: unknown, _encoding: BufferEncoding, cb: (error?: Error | null) => void): void;
    /**
     * Call to set a custom logger for incoming/outgoing messages
     *
     * @param log - the logger function
     */
    _setLogger(log: Log): void;
}
export {};
