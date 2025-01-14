import {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  StorageManager,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';
import { PlatformManager } from '../Platform/PlatfformManager';

export const getStorageManager = async (
  options: StorageManagerProps,
): Promise<StorageManager> => {
  if (PlatformManager.isBrowser()) {
    const { StorageManagerWeb } = await import('./StorageManagerWeb');
    return new StorageManagerWeb(options);
  }

  const noopStorageManager: StorageManager = {
    persistChannelConfig: async () => undefined,
    getPersistedChannelConfig: async () => undefined,
    persistAccounts: async () => undefined,
    getCachedAccounts: async () => [],
    persistChainId: async () => undefined,
    getCachedChainId: async () => undefined,
    terminate: async () => undefined,
  } as StorageManager;

  return Promise.resolve(noopStorageManager);
};
