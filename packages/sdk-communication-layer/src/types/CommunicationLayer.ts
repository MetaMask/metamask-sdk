import { EventEmitter2 } from 'eventemitter2';
import { Channel } from './Channel';
import { CommunicationLayerMessage } from './CommunicationLayerMessage';

export interface CommunicationLayer extends EventEmitter2 {
  createChannel(): Channel;
  connectToChannel(channelId: string): void;
  sendMessage(message: CommunicationLayerMessage): boolean | void;
  pause(): void;
  resume(): void;
  disconnect(): void;
}
