/* c8 ignore start */
import type { TransportType } from '../multichain';

export abstract class StoreClient {
  abstract getAnonId(): Promise<string | null>;

  abstract getExtensionId(): Promise<string | null>;
  abstract setExtensionId(extensionId: string): Promise<void>;

  abstract getTransport(): Promise<TransportType | null>;
  abstract setTransport(transport: TransportType): Promise<void>;
  abstract removeTransport(): Promise<void>;

  abstract setAnonId(anonId: string): Promise<void>;
  abstract removeExtensionId(): Promise<void>;
  abstract removeAnonId(): Promise<void>;
  abstract getDebug(): Promise<string | null>;
}
