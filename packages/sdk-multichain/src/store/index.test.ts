/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as t from 'vitest';
import type { StoreAdapter } from '../domain';
import { StorageDeleteErr, StorageGetErr, StorageSetErr } from '../domain/errors/storage';
import { TransportType } from '../domain/multichain';
import { StoreAdapterNode } from './adapters/node';
import { StoreAdapterRN } from './adapters/rn';
import { StoreAdapterWeb } from './adapters/web';
import { Store } from './index';

/**
 * Dummy mocked storage to keep track of data between tests
 */
const nativeStorageStub = {
	data: new Map<string, string>(),
	getItem: t.vi.fn((key: string) => nativeStorageStub.data.get(key) || null),
	setItem: t.vi.fn((key: string, value: string) => {
		nativeStorageStub.data.set(key, value);
	}),
	removeItem: t.vi.fn((key: string) => {
		nativeStorageStub.data.delete(key);
	}),
	clear: t.vi.fn(() => {
		nativeStorageStub.data.clear();
	}),
};

// Reusable test function that can be used with any adapter
function createStoreTests(adapterName: string, createAdapter: () => StoreAdapter, setupMocks?: () => void, cleanupMocks?: () => void) {
	let store: Store;
	let adapter: StoreAdapter;

	t.beforeEach(async () => {
		setupMocks?.();
		adapter = createAdapter();
		store = new Store(adapter);
	});

	t.afterEach(async () => {
		nativeStorageStub.data.clear();
		cleanupMocks?.();
	});

	t.describe(`${adapterName} constructor`, () => {
		t.it('should create a Store instance with the provided adapter', () => {
			t.expect(store).toBeInstanceOf(Store);
		});
	});

	t.describe(`${adapterName} getAnonId`, () => {
		t.it('should return the anonymous ID when it exists', async () => {
			await adapter.set('anonId', 'test-anon-id');
			const result = await store.getAnonId();
			t.expect(result).toBe('test-anon-id');
		});

		t.it('should return a new when anonymous ID does not exist', async () => {
			const result = await store.getAnonId();
			t.expect(result).not.toBeNull();
		});
	});

	t.describe(`${adapterName} setAnonId`, () => {
		t.it('should set the anonymous ID successfully', async () => {
			await store.setAnonId('new-anon-id');
			const result = await adapter.get('anonId');
			t.expect(result).toBe('new-anon-id');
		});
	});

	t.describe(`${adapterName} removeAnonId`, () => {
		t.it('should remove the anonymous ID successfully', async () => {
			await adapter.set('anonId', 'test-anon-id');
			const beforeRemove = await adapter.get('anonId');
			t.expect(beforeRemove).toBe('test-anon-id');

			await store.removeAnonId();
			const afterRemove = await adapter.get('anonId');
			t.expect(afterRemove).toBeNull();
		});
	});

	t.describe(`${adapterName} getExtensionId`, () => {
		t.it('should return the extension ID when it exists', async () => {
			await adapter.set('extensionId', 'test-extension-id');
			const result = await store.getExtensionId();
			t.expect(result).toBe('test-extension-id');
		});

		t.it('should return null when extension ID does not exist', async () => {
			const result = await store.getExtensionId();
			t.expect(result).toBeNull();
		});
	});

	t.describe(`${adapterName} setExtensionId`, () => {
		t.it('should set the extension ID successfully', async () => {
			await store.setExtensionId('new-extension-id');
			const result = await adapter.get('extensionId');
			t.expect(result).toBe('new-extension-id');
		});
	});

	t.describe(`${adapterName} removeExtensionId`, () => {
		t.it('should remove the extension ID successfully', async () => {
			await adapter.set('extensionId', 'test-extension-id');
			const beforeRemove = await adapter.get('extensionId');
			t.expect(beforeRemove).toBe('test-extension-id');

			await store.removeExtensionId();
			const afterRemove = await adapter.get('extensionId');
			t.expect(afterRemove).toBeNull();
		});
	});

	t.describe(`${adapterName} getDebug`, () => {
		t.it('should return the debug value when it exists', async () => {
			await adapter.set('DEBUG', 'metamask-sdk:*');
			const result = await store.getDebug();
			t.expect(result).toBe('metamask-sdk:*');
		});

		t.it('should return null when debug value does not exist', async () => {
			const result = await store.getDebug();
			t.expect(result).toBeNull();
		});
	});

	t.describe(`${adapterName} getTransport`, () => {
		t.it('should return the transport value when it exists - Browser', async () => {
			await adapter.set('multichain-transport', 'browser');
			const result = await store.getTransport();
			t.expect(result).toBe(TransportType.Browser);
		});

		t.it('should return the transport value when it exists - MPW', async () => {
			await adapter.set('multichain-transport', 'mwp');
			const result = await store.getTransport();
			t.expect(result).toBe(TransportType.MPW);
		});

		t.it('should return UNKNOWN for unknown transport types', async () => {
			await adapter.set('multichain-transport', 'unknown-transport');
			const result = await store.getTransport();
			t.expect(result).toBe(TransportType.UNKNOWN);
		});

		t.it('should return null when transport does not exist', async () => {
			const result = await store.getTransport();
			t.expect(result).toBeNull();
		});
	});

	t.describe(`${adapterName} setTransport`, () => {
		t.it('should set the transport successfully - Browser', async () => {
			await store.setTransport(TransportType.Browser);
			const result = await adapter.get('multichain-transport');
			t.expect(result).toBe('browser');
		});

		t.it('should set the transport successfully - MPW', async () => {
			await store.setTransport(TransportType.MPW);
			const result = await adapter.get('multichain-transport');
			t.expect(result).toBe('mwp');
		});

		t.it('should set the transport successfully - UNKNOWN', async () => {
			await store.setTransport(TransportType.UNKNOWN);
			const result = await adapter.get('multichain-transport');
			t.expect(result).toBe('unknown');
		});
	});

	t.describe(`${adapterName} removeTransport`, () => {
		t.it('should remove the transport successfully', async () => {
			await adapter.set('multichain-transport', 'browser');
			const beforeRemove = await adapter.get('multichain-transport');
			t.expect(beforeRemove).toBe('browser');

			await store.removeTransport();
			const afterRemove = await adapter.get('multichain-transport');
			t.expect(afterRemove).toBeNull();
		});
	});

	// Error handling tests
	t.describe(`${adapterName} error handling`, () => {
		t.it('should throw StorageGetErr when fetching a key fails', async () => {
			const errorMessage = 'getItem failed';
			t.vi.spyOn(adapter, 'get').mockRejectedValue(new Error(errorMessage));
			await t.expect(store.getAnonId()).rejects.toBeInstanceOf(StorageGetErr);
			await t.expect(store.getExtensionId()).rejects.toBeInstanceOf(StorageGetErr);
			await t.expect(store.getDebug()).rejects.toBeInstanceOf(StorageGetErr);
			await t.expect(store.getTransport()).rejects.toBeInstanceOf(StorageGetErr);
		});

		t.it('should throw StorageSetErr when setting a key fails', async () => {
			const errorMessage = 'setItem failed';
			t.vi.spyOn(adapter, 'set').mockRejectedValue(new Error(errorMessage));
			await t.expect(store.setAnonId('test-id')).rejects.toThrow(StorageSetErr);
			await t.expect(store.setExtensionId('test-id')).rejects.toThrow(StorageSetErr);
			await t.expect(store.setTransport(TransportType.Browser)).rejects.toThrow(StorageSetErr);
		});

		t.it('should throw StorageDeleteErr when removing a key fails', async () => {
			const errorMessage = 'deleteItem failed';
			t.vi.spyOn(adapter, 'delete').mockRejectedValue(new Error(errorMessage));
			await t.expect(store.removeAnonId()).rejects.toThrow(StorageDeleteErr);
			await t.expect(store.removeExtensionId()).rejects.toThrow(StorageDeleteErr);
			await t.expect(store.removeTransport()).rejects.toThrow(StorageDeleteErr);
		});
	});
}

t.describe(`Store with NodeAdapter`, () => {
	// Test with Node Adapter - now uses in-memory storage
	createStoreTests('NodeAdapter', () => new StoreAdapterNode());
});

t.describe(`Store with WebAdapter`, () => {
	//Test browser storage with mocked local storage
	createStoreTests(
		'WebAdapter',
		() => new StoreAdapterWeb(),
		() => {
			t.vi.stubGlobal('window', {
				localStorage: nativeStorageStub,
				indexedDB: new IDBFactory(),
			});
		},
	);

	t.it("Should throw an exception if we try using the store with a browser that doesn't support localStorage", async () => {
		t.vi.stubGlobal('window', {
			localStorage: undefined,
			indexedDB: undefined,
		});
		const store = new Store(new StoreAdapterWeb());
		await t.expect(() => store.getAnonId()).rejects.toThrow();
	});
});

t.describe(`Store with RNAdapter`, () => {
	// Test RN storage with mocked AsyncStorage
	createStoreTests(
		'RNAdapter',
		() => new StoreAdapterRN(),
		() => {
			t.vi.spyOn(AsyncStorage, 'getItem').mockImplementation(async (key) => nativeStorageStub.getItem(key));
			t.vi.spyOn(AsyncStorage, 'setItem').mockImplementation(async (key, value) => nativeStorageStub.setItem(key, value));
			t.vi.spyOn(AsyncStorage, 'removeItem').mockImplementation(async (key) => nativeStorageStub.removeItem(key));
		},
	);
});
