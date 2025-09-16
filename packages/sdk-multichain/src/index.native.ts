import type { CreateMultichainFN, StoreClient } from './domain';
import { MultichainSDK } from './multichain';
import { Store } from './store';
import { ModalFactory } from './ui';

export * from './domain';

export const createMetamaskSDK: CreateMultichainFN = async (options) => {
	const uiModules = await import('./ui/modals/rn');
	let storage: StoreClient;
	if (!options.storage) {
		const { StoreAdapterRN } = await import('./store/adapters/rn');
		const adapter = new StoreAdapterRN();
		storage = new Store(adapter);
	} else {
		storage = options.storage;
	}
	const factory = new ModalFactory(uiModules);
	return MultichainSDK.create({
		...options,
		storage,
		ui: {
			...options.ui,
			factory,
		},
	});
};
