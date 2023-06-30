import {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  StorageManager,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';

/* #if _NODEJS
import { StorageManagerNode as SMDyn } from './StorageManagerNode';
//#elif _WEB
import { StorageManagerWeb as SMDyn } from './StorageManagerWeb';
//#else */
import { StorageManagerAS as SMDyn } from './StorageManagerAS';
// #endif

export const getStorageManager = (
  options: StorageManagerProps,
): StorageManager => {
  return new SMDyn(options);
};
