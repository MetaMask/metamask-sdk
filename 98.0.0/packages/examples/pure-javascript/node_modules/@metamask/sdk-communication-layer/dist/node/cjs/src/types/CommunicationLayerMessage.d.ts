import { KeyExchangeMessageType } from './KeyExchangeMessageType';
import { MessageType } from './MessageType';
import { OriginatorInfo } from './OriginatorInfo';
import { WalletInfo } from './WalletInfo';
export interface CommunicationLayerMessage {
    type?: MessageType | KeyExchangeMessageType;
    walletInfo?: WalletInfo;
    originatorInfo?: OriginatorInfo;
    originator?: OriginatorInfo;
    pubkey?: string;
    answer?: RTCSessionDescriptionInit;
    offer?: RTCSessionDescriptionInit;
    v?: number;
    otpAnswer?: number;
    candidate?: unknown;
    message?: unknown;
    method?: string;
    params?: unknown;
    jsonrpc?: string;
    name?: string;
    data?: unknown;
    id?: string;
}
//# sourceMappingURL=CommunicationLayerMessage.d.ts.map