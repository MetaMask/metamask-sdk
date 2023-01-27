import {
  StorageManager,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';

/* #if _NODEJS
import { StorageManagerNode as SMDyn } from './StorageManagerNode';
//#else */
import { StorageManagerAS as SMDyn } from './StorageManagerAS';
// #endif

export const getStorageManager = (
  options: StorageManagerProps,
): StorageManager => {
  return new SMDyn(options);
};
