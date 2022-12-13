import { MessageType } from './MessageType';
import { OriginatorInfo } from './OriginatorInfo';
import { WalletInfo } from './WalletInfo';

export interface CommunicationLayerMessage {
  type: MessageType;
  walletInfo?: WalletInfo;
  originatorInfo?: OriginatorInfo;
  pubkey?: string;
  answer?: RTCSessionDescriptionInit;
  offer?: RTCSessionDescriptionInit;
  candidate?: unknown;
}
