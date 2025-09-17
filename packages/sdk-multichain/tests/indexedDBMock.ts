import { StoreAdapterWeb } from '../src/store/adapters/web';

export async function updateIndexedDBMock(key: string, value: string | null): Promise<void> {
	return new Promise((resolve, reject) => {
		const dbName = `${StoreAdapterWeb.DB_NAME}-kv-store`;
		const storeName = StoreAdapterWeb.stores[0];

		const request = window.indexedDB.open(dbName, 1);

		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(storeName)) {
				db.createObjectStore(storeName);
			}
		};

		request.onerror = () => reject(new Error('Failed to open IndexedDB.'));

		request.onsuccess = () => {
			const db = request.result;
			try {
				const tx = db.transaction(storeName, 'readwrite');
				const store = tx.objectStore(storeName);

				const req = value === null ? store.delete(key) : store.put(value, key);

				tx.oncomplete = () => {
					db.close();
					resolve();
				};

				tx.onerror = () => {
					db.close();
					reject(new Error('Failed to update value in IndexedDB.'));
				};
			} catch (error) {
				db.close();
				reject(error);
			}
		};
	});
}
