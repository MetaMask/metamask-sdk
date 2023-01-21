import { EventEmitter2 } from 'eventemitter2';
import { Channel } from './Channel';
import { CommunicationLayerMessage } from './CommunicationLayerMessage';
import { DisconnectOptions } from './DisconnectOptions';
import { KeyInfo } from './KeyInfo';

export interface CommunicationLayer extends EventEmitter2 {
  createChannel(): Channel;
  connectToChannel(channelId: string, isOriginator?: boolean): void;
  sendMessage(message: CommunicationLayerMessage): boolean | void;
  getKeyInfo(): KeyInfo;
  pause(): void;
  resetKeys(): void;
  resume(): void;
  disconnect(options?: DisconnectOptions): void;
}
