import { StorageManager, StorageManagerProps } from './StorageManager';
/* #if _REACTNATIVE
import { StorageManagerRN as SMDyn } from './StorageManagerRN';
//#elif _NODEJS
import { StorageManagerNode as SMDyn } from './StorageManagerNode';
//#else */
import { StorageManagerWeb as SMDyn } from './StorageManagerWeb';
// #endif

export const getStorageManager = (
  options: StorageManagerProps,
): StorageManager => {
  return new SMDyn(options);
};
