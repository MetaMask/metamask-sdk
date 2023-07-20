import {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  StorageManager,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';
// import { PlatformManager } from '../Platform/PlatfformManager';

/* #if _NODEJS
import { StorageManagerNode as SMDyn } from './StorageManagerNode';
//#elif _WEB
import { StorageManagerWeb as SMDyn } from './StorageManagerWeb';
//#else */
import { StorageManagerAS as SMDyn } from './StorageManagerAS';
// #endif

export const getStorageManager = (
  // platformManager: PlatformManager,
  options: StorageManagerProps,
): StorageManager => {
  // TODO uncomment and test to use similar dynamic imports for each platforms and drop support for JSCC
  // Currently might have an issue with NextJS and server side rendering
  // if (platformManager.isNotBrowser()) {
  //   const { StorageManagerNode } = await import('./StorageManagerNode');
  //   return new StorageManagerNode(options);
  // }
  return new SMDyn(options);
};
