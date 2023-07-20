import {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  StorageManager,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';
import { PlatformManager } from '../Platform/PlatfformManager';

/* #if _NODEJS
import { StorageManagerNode as SMDyn } from './StorageManagerNode';
//#elif _WEB
import { StorageManagerWeb as SMDyn } from './StorageManagerWeb';
//#else */
import { StorageManagerAS as SMDyn } from './StorageManagerAS';
// #endif

export const getStorageManager = async (
  platformManager: PlatformManager,
  options: StorageManagerProps,
): Promise<StorageManager> => {
  // TODO use similar dynamic imports for each platforms and drop support for JSCC
  if (platformManager.isNotBrowser()) {
    const { StorageManagerNode } = await import('./StorageManagerNode');
    return new StorageManagerNode(options);
  }
  return new SMDyn(options);
};
