import { KeyExchangeMessageType } from './KeyExchangeMessageType';
import { MessageType } from './MessageType';
import { OriginatorInfo } from './OriginatorInfo';
import { WalletInfo } from './WalletInfo';

export interface CommunicationLayerMessage {
  type?: MessageType | KeyExchangeMessageType;
  walletInfo?: WalletInfo;
  originatorInfo?: OriginatorInfo;
  pubkey?: string;
  answer?: RTCSessionDescriptionInit;
  offer?: RTCSessionDescriptionInit;
  candidate?: unknown;
  // need to add a message field for backward compatibility on protocol < v0.2.0
  message?: unknown;
  // JSON-RPC related properties
  method?: string;
  params?: unknown;
  jsonrpc?: string;
  name?: string;
  data?: unknown;
  id?: string;
}
