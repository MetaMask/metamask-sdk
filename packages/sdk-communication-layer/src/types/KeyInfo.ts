import { MessageType } from './MessageType';

export interface KeyInfo {
  step: MessageType;
  ecies: {
    public: string;
    private: string;
    otherPubKey?: string;
  };
  keysExchanged: boolean;
}
