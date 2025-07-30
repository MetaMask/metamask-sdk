/* c8 ignore start */
// biome-ignore lint/suspicious/noExplicitAny: Needed here
export type StoreOptions = Record<string, any>;

export abstract class StoreAdapter {
	abstract platform: 'web' | 'rn' | 'node';
	constructor(public options?: StoreOptions) {}
	abstract get(key: string): Promise<string | null>;
	abstract set(key: string, value: string): Promise<void>;
	abstract delete(key: string): Promise<void>;
}
