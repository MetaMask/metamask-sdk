import type { CreateMultichainFN } from './domain';
import { MultichainSDK } from './multichain';
import { Store } from './store';
import { UIModule } from './ui';

export * from './domain';

export const createMetamaskSDK: CreateMultichainFN = async (options) => {
  const { StoreAdapterWeb } = await import('./store/adapters/web');
  const uiModules = await import('./ui/web');
  const adapter = new StoreAdapterWeb();
  const storage = new Store(adapter);
  const factory = new UIModule(uiModules);
  return MultichainSDK.create({
    ...options,
    storage,
    ui: {
      ...options.ui,
      factory,
    },
  });
};
