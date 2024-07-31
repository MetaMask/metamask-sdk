import { EventEmitter2 } from 'eventemitter2';
import { RPCMethodCache } from '../SocketService';
import { KeyExchange } from '../KeyExchange';
import { Channel } from './Channel';
import { CommunicationLayerMessage } from './CommunicationLayerMessage';
import { ConnectToChannelOptions } from './ConnectToChannelOptions';
import { DisconnectOptions } from './DisconnectOptions';
import { KeyInfo } from './KeyInfo';
export interface CommunicationLayer extends EventEmitter2 {
    createChannel(): Channel;
    connectToChannel(options: ConnectToChannelOptions): void;
    sendMessage(message: CommunicationLayerMessage): boolean | void;
    getKeyInfo(): KeyInfo;
    pause(): void;
    resetKeys(): void;
    ping(): void;
    keyCheck(): void;
    isConnected(): boolean;
    getRPCMethodTracker(): RPCMethodCache;
    resume(): void;
    disconnect(options?: DisconnectOptions): void;
    getKeyExchange(): KeyExchange;
}
//# sourceMappingURL=CommunicationLayer.d.ts.map