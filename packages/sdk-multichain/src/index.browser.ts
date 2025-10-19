import type { CreateMultichainFN, StoreClient } from './domain';
import { MultichainConnect } from './multichain';
import { Store } from './store';
import { ModalFactory } from './ui';

export * from './domain';

export const createMetamaskConnect: CreateMultichainFN = async (options) => {
	const uiModules = await import('./ui/modals/web');
	let storage: StoreClient;
	if (!options.storage) {
		const { StoreAdapterWeb } = await import('./store/adapters/web');
		const adapter = new StoreAdapterWeb();
		storage = new Store(adapter);
	} else {
		storage = options.storage;
	}
	const factory = new ModalFactory(uiModules);
	return MultichainConnect.create({
		...options,
		storage,
		ui: {
			...options.ui,
			factory,
		},
	});
};
