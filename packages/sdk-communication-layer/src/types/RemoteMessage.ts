import { type OriginatorInfo } from '@metamask/sdk-types'; // Use types package
import { MessageType } from './MessageType';

export interface RemoteMessage {
  type: MessageType;
  originatorInfo?: OriginatorInfo;
}
