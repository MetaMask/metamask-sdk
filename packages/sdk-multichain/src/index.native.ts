import type { CreateMultichainFN } from './domain';
import { MultichainSDK } from './multichain';
import { Store } from './store';

export type * from './domain';

export const createMetamaskSDK: CreateMultichainFN = async ({
  storage,
  ...options
}) => {
   const { StoreAdapterRN } = await import('./store/adapters/rn');
  const adapter = new StoreAdapterRN(storage);
  return MultichainSDK.create({
    ...options,
    storage: new Store(adapter),
  });
}