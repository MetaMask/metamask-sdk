import type { CreateMultichainFN } from './domain';
import { MultichainSDK } from './multichain';
import { Store } from './store';
import { UIModule } from './ui';

export * from './domain';

export const createMetamaskSDK: CreateMultichainFN = async (options) => {
	const { StoreAdapterNode } = await import('./store/adapters/node');
	const uiModules = await import('./ui/node');
	const adapter = new StoreAdapterNode();
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
