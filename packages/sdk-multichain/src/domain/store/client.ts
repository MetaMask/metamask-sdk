/* c8 ignore start */
import type { StoreAdapter } from '../store';
import type { TransportType } from '../multichain';

export abstract class StoreClient {
	abstract adapter: StoreAdapter;
	abstract getAnonId(): Promise<string>;

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
