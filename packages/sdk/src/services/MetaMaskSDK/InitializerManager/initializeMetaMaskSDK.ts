import { logger } from '../../../utils/logger';
import { MetaMaskSDK } from '../../../sdk';
import { performSDKInitialization } from './performSDKInitialization';

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
export async function initializeMetaMaskSDK(instance: MetaMaskSDK) {
  if (typeof window !== 'undefined' && window.mmsdk?.isInitialized()) {
    logger(`[MetaMaskSDK: initializeMetaMaskSDK()] already initialized`);

    return Promise.resolve(window.mmsdk);
  }

  if (instance._initialized) {
    logger(`[MetaMaskSDK: initializeMetaMaskSDK()] already initialized`);

    return instance.sdkInitPromise;
  } else if (instance.sdkInitPromise) {
    logger(`[MetaMaskSDK: initializeMetaMaskSDK()] already initializing`);

    return instance.sdkInitPromise;
  }

  // Prevent multiple instances of the SDK to be initialized at the same time
  try {
    instance.sdkInitPromise = performSDKInitialization(instance);
    await instance.sdkInitPromise;
  } catch (err) {
    console.error(err);
    throw err;
  }

  return instance.sdkInitPromise;
}
