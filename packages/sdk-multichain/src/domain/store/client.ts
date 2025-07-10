/* c8 ignore start */
export interface ChannelConfig {
  channelId: string;
  validUntil: number;
  otherKey?: string;
  localKey?: string;
  walletVersion?: string;
  deeplinkProtocolAvailable?: boolean;
  relayPersistence?: boolean; // Set if the session has full relay persistence (can exchange message without the other side connected)
  /**
   * lastActive: ms value of the last time connection was ready CLIENTS_READY event.
   * */
  lastActive?: number;
}

export abstract class StoreClient {
  abstract getAnonId(): Promise<string | null>;

  abstract getExtensionId(): Promise<string | null>;

  abstract getChannelConfig(): Promise<ChannelConfig | null>;

  abstract setExtensionId(extensionId: string): Promise<void>;

  abstract setAnonId(anonId: string): Promise<void>;

  abstract setChannelConfig(channelConfig: ChannelConfig): Promise<void>;

  abstract removeExtensionId(): Promise<void>;

  abstract removeAnonId(): Promise<void>;

  abstract getDebug(): Promise<string | null>;
}
