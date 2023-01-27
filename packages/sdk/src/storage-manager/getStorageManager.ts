import {
  StorageManager,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';

/* #if _REACTNATIVE
import { StorageManagerRN as SMDyn } from './StorageManagerRN';
//#elif _NODEJS
import { StorageManagerNode as SMDyn } from './StorageManagerNode';
//#else */
// import { StorageManagerWeb as SMDyn } from './StorageManagerWeb';
import { StorageManagerRN as SMDyn } from './StorageManagerRN';
// #endif

export const getStorageManager = (
  options: StorageManagerProps,
): StorageManager => {
  return new SMDyn(options);
};
