/// <reference types="node" />
import { Duplex } from 'stream';
/**
 * Creates a stream that's both readable and writable.
 * The stream supports arbitrary objects.
 *
 * @class
 * @param {Object} port Remote Port object
 */
declare class MobilePortStream extends Duplex {
    _name: any;
    _targetWindow: Window & typeof globalThis;
    _port: any;
    _origin: string;
    _onMessage: any;
    _onDisconnect: () => void;
    constructor(port: any);
}
export default MobilePortStream;
