import { StoreAdapter } from '../../domain';

type kvStores = 'sdk-kv-store' | 'key-value-pairs';

export class StoreAdapterWeb extends StoreAdapter {
	static readonly stores: kvStores[] = ['sdk-kv-store', 'key-value-pairs'];
	static readonly DB_NAME = 'mmsdk';

	readonly platform = 'web';
	readonly dbPromise: Promise<IDBDatabase>;

	private get internal() {
		if (typeof window === 'undefined' || !window.indexedDB) {
			throw new Error('indexedDB is not available in this environment');
		}
		return window.indexedDB;
	}

	constructor(
		dbNameSuffix: `-${string}` = '-kv-store',
		private storeName: kvStores = StoreAdapterWeb.stores[0],
	) {
		super();

		const dbName = `${StoreAdapterWeb.DB_NAME}${dbNameSuffix}`;

		this.dbPromise = new Promise((resolve, reject) => {
			try {
				const request = this.internal.open(dbName, 1);
				request.onerror = () => reject(new Error('Failed to open IndexedDB.'));
				request.onsuccess = () => resolve(request.result);
				request.onupgradeneeded = () => {
					const db = request.result;
					for (const name of StoreAdapterWeb.stores) {
						if (!db.objectStoreNames.contains(name)) {
							db.createObjectStore(name);
						}
					}
				};
			} catch (error) {
				reject(error);
			}
		});
	}

	async get(key: string): Promise<string | null> {
		const { storeName } = this;
		const db = await this.dbPromise;
		return new Promise((resolve, reject) => {
			const tx = db.transaction(storeName, 'readonly');
			const store = tx.objectStore(storeName);
			const request = store.get(key);
			request.onerror = () => reject(new Error('Failed to get value from IndexedDB.'));
			request.onsuccess = () => resolve((request.result as string) ?? null);
		});
	}

	async set(key: string, value: string): Promise<void> {
		const { storeName } = this;
		const db = await this.dbPromise;
		return new Promise((resolve, reject) => {
			const tx = db.transaction(storeName, 'readwrite');
			const store = tx.objectStore(storeName);
			const request = store.put(value, key);
			request.onerror = () => reject(new Error('Failed to set value in IndexedDB.'));
			request.onsuccess = () => resolve();
		});
	}

	async delete(key: string): Promise<void> {
		const { storeName } = this;
		const db = await this.dbPromise;
		return new Promise((resolve, reject) => {
			const tx = db.transaction(storeName, 'readwrite');
			const store = tx.objectStore(storeName);
			const request = store.delete(key);
			request.onerror = () => reject(new Error('Failed to delete value from IndexedDB.'));
			request.onsuccess = () => resolve();
		});
	}
}
