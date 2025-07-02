import { ChannelConfig } from "@metamask/sdk-communication-layer";

export abstract class StoreClient {
  abstract getAnonId(): Promise<string| null>;
  abstract getExtensionId(): Promise<string| null>;

  abstract getChannelConfig(): Promise<ChannelConfig | null>;

  abstract setExtensionId(extensionId: string): Promise<void>;
  abstract setAnonId(anonId: string): Promise<void>;
  abstract setChannelConfig(channelConfig: ChannelConfig): Promise<void>;

  abstract removeExtensionId(): Promise<void>;
  abstract removeAnonId(): Promise<void>;

  abstract getDebug(): Promise<string | null>;
}
