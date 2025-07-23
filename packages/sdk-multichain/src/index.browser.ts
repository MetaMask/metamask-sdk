import type { CreateMultichainFN } from './domain';
import { MultichainSDK } from './multichain';
import { Store } from './store';

export type * from './domain';

export const createMetamaskSDK: CreateMultichainFN = async (options) => {
	const { StoreAdapterWeb } = await import('./store/adapters/web');
	const adapter = new StoreAdapterWeb();
	return MultichainSDK.create({
		...options,
		storage: new Store(adapter),
		ui: {
			headless: options.ui?.headless ?? false,
		},
	});
};
