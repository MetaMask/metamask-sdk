import {
  ChannelConfig,
  DisconnectProps, RemoteCommunication
} from '@metamask/sdk-communication-layer';

export interface ProviderService {
  startConnection(): Promise<boolean>;
  isConnected(): boolean;
  getConnector(): RemoteCommunication | unknown;
  getUniversalLink(): string;
  getChannelConfig(): ChannelConfig | undefined;
  disconnect(options?: DisconnectProps): void;
}
