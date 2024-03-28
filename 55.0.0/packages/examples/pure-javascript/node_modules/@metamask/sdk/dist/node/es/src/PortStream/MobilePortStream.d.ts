/// <reference types="node" />
import { Duplex } from 'readable-stream';
/**
 * Creates a stream that's both readable and writable.
 * The stream supports arbitrary objects.
 *
 * @class
 * @param {Object} port Remote Port object
 */
export declare class MobilePortStream extends Duplex {
    _name: any;
    _targetWindow: Window & typeof globalThis;
    _port: any;
    _origin: string;
    constructor(port: {
        name: string;
    });
    /**
     * Callback triggered when a message is received from
     * the remote Port associated with this Stream.
     *
     * @private
     * @param {Object} msg - Payload from the onMessage listener of Port
     */
    _onMessage(event: any): void;
    /**
     * Callback triggered when the remote Port
     * associated with this Stream disconnects.
     *
     * @private
     */
    _onDisconnect(): void;
    /**
     * Explicitly sets read operations to a no-op
     */
    _read: () => undefined;
    /**
     * Called internally when data should be written to
     * this writable stream.
     *
     * @private
     * @param {*} chunk Arbitrary object to write
     * @param {string} encoding Encoding to use when writing payload
     * @param {Function} cb Called when writing is complete or an error occurs
     */
    _write(chunk: any, _encoding: BufferEncoding, cb: (error?: Error | null) => void): void;
}
//# sourceMappingURL=MobilePortStream.d.ts.map