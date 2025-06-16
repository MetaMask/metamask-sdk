import type { CreateMultichainFN } from './domain';
import { MultichainSDK } from './multichain';
import { Store } from './store';

export type * from './domain';

export const createMetamaskSDK: CreateMultichainFN = async ({
  storage,
  ...options
}) => {
  const { StoreAdapterNode } = await import('./store/adapters/node');
  const adapter = new StoreAdapterNode(storage);
  return MultichainSDK.create({
    ...options,
    storage: new Store(adapter),
  });
}