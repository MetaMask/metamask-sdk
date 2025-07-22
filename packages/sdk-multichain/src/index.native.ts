import type { CreateMultichainFN } from "./domain";
import { MultichainSDK } from "./multichain";
import { Store } from "./store";

export type * from "./domain";

export const createMetamaskSDK: CreateMultichainFN = async (options) => {
	const { StoreAdapterRN } = await import("./store/adapters/rn");
	const adapter = new StoreAdapterRN();
	return MultichainSDK.create({
		...options,
		storage: new Store(adapter),
		ui: {
			headless: options.ui?.headless ?? false, // React Native can show UI
		},
	});
};
