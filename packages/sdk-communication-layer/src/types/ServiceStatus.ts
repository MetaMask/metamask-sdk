import { type OriginatorInfo } from '@metamask/sdk-types';
import { ChannelConfig } from './ChannelConfig';
import { ConnectionStatus } from './ConnectionStatus';
import { KeyInfo } from './KeyInfo';

export interface ServiceStatus {
  keyInfo?: KeyInfo;
  channelConfig?: ChannelConfig;
  channelId?: string;
  originatorInfo?: OriginatorInfo;
  connectionStatus?: ConnectionStatus;
}
