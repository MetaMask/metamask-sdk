import * as t from 'vitest'
import fs from 'fs'
import path from 'path';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Store } from './index';
import type { StoreAdapter } from '../domain';
import { StoreAdapterWeb } from './adapters/web';
import { StoreAdapterRN } from './adapters/rn';
import { StoreAdapterNode } from './adapters/node';
import { StorageGetErr, StorageSetErr, StorageDeleteErr } from '../domain/errors/storage';

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
}

// Reusable test function that can be used with any adapter
function createStoreTests(
  adapterName: string,
  createAdapter: () => StoreAdapter,
  setupMocks?: () => void,
  cleanupMocks?: () => void
) {
  let store: Store;
  let adapter: StoreAdapter;

  t.beforeEach(async () => {
    setupMocks?.();
    adapter = createAdapter();
    store = new Store(adapter);
  });

  t.afterEach(async () => {
    nativeStorageStub.data.clear()
    cleanupMocks?.();
  });

  t.describe(`${adapterName} constructor`, () => {
    t.it('should create a Store instance with the provided adapter', () => {
      t.expect(store).toBeInstanceOf(Store);
    });
  });

  t.describe(`${adapterName} getAnonId`, () => {
    t.it('should return the anonymous ID when it exists', async () => {
      await adapter.setItem('anonId', 'test-anon-id');
      const result = await store.getAnonId();
      t.expect(result).toBe('test-anon-id');
    });

    t.it('should return null when anonymous ID does not exist', async () => {
      const result = await store.getAnonId();
      t.expect(result).toBeNull();
    });
  });

  t.describe(`${adapterName} setAnonId`, () => {
    t.it('should set the anonymous ID successfully', async () => {
      await store.setAnonId('new-anon-id');
      const result = await adapter.getItem('anonId');
      t.expect(result).toBe('new-anon-id');
    });
  });

  t.describe(`${adapterName} removeAnonId`, () => {
    t.it('should remove the anonymous ID successfully', async () => {
      await adapter.setItem('anonId', 'test-anon-id');
      const beforeRemove = await adapter.getItem('anonId');
      t.expect(beforeRemove).toBe('test-anon-id');

      await store.removeAnonId();
      const afterRemove = await adapter.getItem('anonId');
      t.expect(afterRemove).toBeNull();
    });
  });

  t.describe(`${adapterName} getExtensionId`, () => {
    t.it('should return the extension ID when it exists', async () => {
      await adapter.setItem('extensionId', 'test-extension-id');
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
      const result = await adapter.getItem('extensionId');
      t.expect(result).toBe('new-extension-id');
    });
  });

  t.describe(`${adapterName} removeExtensionId`, () => {
    t.it('should remove the extension ID successfully', async () => {
      await adapter.setItem('extensionId', 'test-extension-id');
      const beforeRemove = await adapter.getItem('extensionId');
      t.expect(beforeRemove).toBe('test-extension-id');

      await store.removeExtensionId();
      const afterRemove = await adapter.getItem('extensionId');
      t.expect(afterRemove).toBeNull();
    });
  });

  t.describe(`${adapterName} getDebug`, () => {
    t.it('should return the debug value when it exists', async () => {
      await adapter.setItem('DEBUG', 'metamask-sdk:*');
      const result = await store.getDebug();
      t.expect(result).toBe('metamask-sdk:*');
    });

    t.it('should return null when debug value does not exist', async () => {
      const result = await store.getDebug();
      t.expect(result).toBeNull();
    });
  });

  // Error handling tests
  t.describe(`${adapterName} error handling`, () => {
    t.it('should throw StorageGetErr when fetching a key fails', async () => {
      const errorMessage = 'getItem failed';
      t.vi.spyOn(adapter, 'getItem').mockRejectedValue(new Error(errorMessage));
      await t.expect(store.getAnonId()).rejects.toBeInstanceOf(StorageGetErr);
      await t.expect(store.getExtensionId()).rejects.toBeInstanceOf(StorageGetErr);
      await t.expect(store.getDebug()).rejects.toBeInstanceOf(StorageGetErr);
    });

    t.it('should throw StorageSetErr when setting a key fails', async () => {
      const errorMessage = 'setItem failed';
      t.vi.spyOn(adapter, 'setItem').mockRejectedValue(new Error(errorMessage));
      await t.expect(store.setAnonId('test-id')).rejects.toThrow(StorageSetErr);
      await t.expect(store.setExtensionId('test-id')).rejects.toThrow(StorageSetErr);
      await t.expect(store.setExtensionId('test-id')).rejects.toThrow(StorageSetErr);
    });

    t.it('should throw StorageDeleteErr when removing a key fails', async () => {
      const errorMessage = 'deleteItem failed';
      t.vi.spyOn(adapter, 'deleteItem').mockRejectedValue(new Error(errorMessage));
      await t.expect(store.removeAnonId()).rejects.toThrow(StorageDeleteErr);
      await t.expect(store.removeExtensionId()).rejects.toThrow(StorageDeleteErr);
    });
  });
}


t.describe(`Store with NodeAdapter`, () => {
  // Test with Node Adapter and mocked file system
  createStoreTests(
    'NodeAdapter',
    () => new StoreAdapterNode(),
    async () => {
      const memfs = new Map<string, any>()
      t.vi.spyOn(fs, 'existsSync').mockImplementation((path) => memfs.has(path.toString()))
      t.vi.spyOn(fs, 'writeFileSync').mockImplementation((path, data) => memfs.set(path.toString(), data))
      t.vi.spyOn(fs, 'readFileSync').mockImplementation((path) => memfs.get(path.toString()))
    }
  );

  t.it("Should gracefully manage deleteItem even if the config file does not exist", async () => {
    const CONFIG_FILE = path.resolve(process.cwd(), '.metamask.json');
    t.vi.spyOn(fs, 'existsSync').mockImplementation(() => false)
    const store = new Store(new StoreAdapterNode())
    await store.removeExtensionId()
    t.expect(fs.existsSync).toHaveBeenCalledWith(CONFIG_FILE)
  })
});

t.describe(`Store with WebAdapter`, () => {
  //Test browser storage with mocked local storage
  createStoreTests(
    'WebAdapter',
    () => new StoreAdapterWeb(),
    () => {
      t.vi.stubGlobal('window', {
        localStorage: nativeStorageStub,
      });
    }
  );

  t.it("Should throw an exception if we try using the store with a browser that doesn't support localStorage", async () => {
    t.vi.stubGlobal('window', {
      localStorage: null,
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
      t.vi.spyOn(AsyncStorage, 'getItem').mockImplementation(async (key) => nativeStorageStub.getItem(key))
      t.vi.spyOn(AsyncStorage, 'setItem').mockImplementation(async (key, value) => nativeStorageStub.setItem(key, value))
      t.vi.spyOn(AsyncStorage, 'removeItem').mockImplementation(async (key) => nativeStorageStub.removeItem(key))
    }
  );
});
