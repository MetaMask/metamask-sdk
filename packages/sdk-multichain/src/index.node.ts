import type { CreateMultichainFN } from "./domain";
import { MultichainSDK } from "./multichain";
import { Store } from "./store";

export type * from "./domain";

export const createMetamaskSDK: CreateMultichainFN = async (options) => {
	const { StoreAdapterNode } = await import("./store/adapters/node");
	const adapter = new StoreAdapterNode();
	return MultichainSDK.create({
		...options,
		storage: new Store(adapter),
		ui: {
			headless: true, // Node.js defaults to headless
		},
	});
};
