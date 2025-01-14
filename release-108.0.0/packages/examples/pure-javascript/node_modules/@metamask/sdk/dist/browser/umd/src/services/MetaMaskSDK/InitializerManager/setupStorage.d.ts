import { MetaMaskSDK } from '../../../sdk';
/**
 * Initializes and sets up the storage manager for the MetaMaskSDK instance.
 *
 * This function checks if the storage option is enabled in the SDK instance. If enabled, it uses the `getStorageManager`
 * function to obtain an instance of the storage manager configured with the options provided within the MetaMaskSDK instance.
 * This storage manager is then stored back into the options for later use.
 *
 * @param instance The current instance of the MetaMaskSDK, which contains user-defined or default options.
 * @returns {Promise<void>} A Promise that resolves when the storage manager has been successfully set up.
 */
export declare function setupStorageManager(instance: MetaMaskSDK): Promise<void>;
//# sourceMappingURL=setupStorage.d.ts.map