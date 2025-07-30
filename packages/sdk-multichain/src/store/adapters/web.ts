import { StoreAdapter } from '../../domain';

export class StoreAdapterWeb extends StoreAdapter {
	readonly platform = 'web';

	private get internal() {
		if (typeof window === 'undefined' || !window.localStorage) {
			throw new Error('localStorage is not available in this environment');
		}
		return window.localStorage;
	}
	async get(key: string): Promise<string | null> {
		return this.internal.getItem(key);
	}

	async set(key: string, value: string): Promise<void> {
		return this.internal.setItem(key, value);
	}

	async delete(key: string): Promise<void> {
		return this.internal.removeItem(key);
	}
}
