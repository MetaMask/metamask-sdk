/* c8 ignore start */

export abstract class StoreClient {
	abstract getAnonId(): Promise<string | null>;
	abstract getExtensionId(): Promise<string | null>;
	abstract setExtensionId(extensionId: string): Promise<void>;
	abstract setAnonId(anonId: string): Promise<void>;
	abstract removeExtensionId(): Promise<void>;
	abstract removeAnonId(): Promise<void>;
	abstract getDebug(): Promise<string | null>;
}
