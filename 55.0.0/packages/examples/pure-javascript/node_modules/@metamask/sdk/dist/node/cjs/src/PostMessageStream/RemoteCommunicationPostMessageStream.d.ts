/// <reference types="node" />
import { Duplex } from 'readable-stream';
import { CommunicationLayerMessage, RemoteCommunication } from '@metamask/sdk-communication-layer';
import { PlatformManager } from '../Platform/PlatfformManager';
import { ProviderConstants } from '../constants';
import { PostMessageStream } from './PostMessageStream';
interface RemoteCommunicationPostMessageStreamState {
    _name: any;
    remote: RemoteCommunication | null;
    platformManager: PlatformManager | null;
}
export declare class RemoteCommunicationPostMessageStream extends Duplex implements PostMessageStream {
    state: RemoteCommunicationPostMessageStreamState;
    constructor({ name, remote, platformManager, }: {
        name: ProviderConstants;
        remote: RemoteCommunication;
        platformManager: PlatformManager;
    });
    /**
     * Called when querying the sdk provider with ethereum.request
     */
    _write(chunk: any, _encoding: BufferEncoding, callback: (error?: Error | null) => void): Promise<void>;
    _read(): undefined;
    _onMessage(message: CommunicationLayerMessage): void;
    start(): void;
}
export {};
//# sourceMappingURL=RemoteCommunicationPostMessageStream.d.ts.map