import { MetaMaskSDK } from '../../../sdk';
/**
 * Performs the complete initialization of the MetaMask SDK instance.
 *
 * This function sets up the SDK with a series of asynchronous tasks, including:
 * - Setting up default options and logging preferences.
 * - Configuring the platform manager.
 * - Initializing analytics.
 * - Setting up storage manager.
 * - Configuring Dapp metadata.
 * - Setting up Infura provider.
 * - Setting up read-only RPC providers.
 * - Handling extension preferences.
 * - Setting up remote connections and installer.
 * - Initializing the provider and event listeners.
 * - Handling automatic and extension-based connections.
 *
 * @param instance The MetaMaskSDK instance to be fully initialized.
 * @returns void
 * @async
 */
export declare function performSDKInitialization(instance: MetaMaskSDK): Promise<void>;
//# sourceMappingURL=performSDKInitialization.d.ts.map