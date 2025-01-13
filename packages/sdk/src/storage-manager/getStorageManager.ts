import {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  StorageManager,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';
import { PlatformManager } from 'src/Platform/PlatfformManager';

/* #if _NODEJS
import { StorageManagerNode as SMDyn } from './StorageManagerNode';
//#elif _WEB
import { StorageManagerWeb as SMDyn } from './StorageManagerWeb';
//#elif _REACTNATIVE
import { StorageManagerAS as SMDyn } from './StorageManagerAS';
//#else */
// This is ONLY used during development with devnext/devreactnative or via transpiling
import { StorageManagerAS as SMDyn } from './StorageManagerAS';
// eslint-disable-next-line spaced-comment
//#endif

export const getStorageManager = (
  options: StorageManagerProps,
): StorageManager => {
  if (PlatformManager.isBrowser()) {
    return new SMDyn(options);
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

  return noopStorageManager;
};
