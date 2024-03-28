import { MetaMaskSDK } from '../../../sdk';
/**
 * Initializes the MetaMask SDK instance.
 *
 * This function checks if the SDK instance is already initialized or in the process of initializing.
 * If not, it calls 'performSDKInitialization' to complete the initialization. The initialization promise
 * is stored in 'instance.sdkInitPromise' to prevent multiple simultaneous initializations.
 *
 * @param instance The MetaMaskSDK instance to be initialized.
 * @returns A Promise that resolves when the SDK has been successfully initialized.
 * @throws Error if the initialization process encounters an error.
 */
export declare function initializeMetaMaskSDK(instance: MetaMaskSDK): Promise<void | MetaMaskSDK>;
//# sourceMappingURL=initializeMetaMaskSDK.d.ts.map