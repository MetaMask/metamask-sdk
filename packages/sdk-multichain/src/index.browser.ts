import type { CreateMultichainFN, StoreClient } from './domain';
import { MultichainSDK } from './multichain';
import { Store } from './store';
import { UIModule } from './ui';

export * from './domain';

export const createMetamaskSDK: CreateMultichainFN = async (options) => {
	const uiModules = await import('./ui/web');
	let storage: StoreClient;
	if (!options.storage) {
		const { StoreAdapterWeb } = await import('./store/adapters/web');
		const adapter = new StoreAdapterWeb();
		storage = new Store(adapter);
	} else {
		storage = options.storage;
	}
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
