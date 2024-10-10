/// <reference types="node" />
import { CommunicationLayerMessage, RemoteCommunication } from '@metamask/sdk-communication-layer';
import { Duplex } from 'readable-stream';
import { PlatformManager } from '../Platform/PlatfformManager';
import { ProviderConstants } from '../constants';
import { PostMessageStream } from './PostMessageStream';
interface RemoteCommunicationPostMessageStreamState {
    _name: any;
    remote: RemoteCommunication | null;
    deeplinkProtocol: boolean;
    platformManager: PlatformManager | null;
}
export declare class RemoteCommunicationPostMessageStream extends Duplex implements PostMessageStream {
    state: RemoteCommunicationPostMessageStreamState;
    constructor({ name, remote, deeplinkProtocol, platformManager, }: {
        name: ProviderConstants;
        deeplinkProtocol: boolean;
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