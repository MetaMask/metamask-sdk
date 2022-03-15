/// <reference types="node" />
import { Duplex } from 'stream';
/**
 * Creates a stream that's both readable and writable.
 * The stream supports arbitrary objects.
 *
 * @class
 * @param {Object} port Remote Port object
 */
declare class WalletConnectPortStream extends Duplex {
    _name: any;
    _targetWindow: Window & typeof globalThis;
    _port: any;
    _origin: string;
    _onMessage: any;
    _onDisconnect: () => void;
    private _alreadySubscribed;
    constructor(port: any);
    getProviderState(): any;
    setProviderState({ chainId, accounts }: {
        chainId: any;
        accounts: any;
    }): void;
    subscribeToConnectionEvents(): void;
}
export default WalletConnectPortStream;
