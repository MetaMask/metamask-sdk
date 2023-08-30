import { MetaMaskSDK } from '../../../sdk';

/**
 * Initializes configurable variables within the MetaMask SDK instance.
 *
 * This function sets up the developer mode and debug options based on the provided instance options.
 * If the developer mode is enabled, all types of logging across various layers are also enabled.
 *
 * @param instance The MetaMaskSDK instance for which variables will be initialized.
 * @returns void
 * @async
 */
export async function initializeVariables(instance: MetaMaskSDK) {
  const { options } = instance;

  // Set developer mode and debug options
  const developerMode = options.logging?.developerMode === true;
  instance.debug = options.logging?.sdk || developerMode;

  if (instance.debug) {
    console.debug(`SDK::initializeVariables()`, instance.options);
  }

  // Make sure to enable all logs if developer mode is on
  const runtimeLogging = { ...options.logging };

  if (developerMode) {
    runtimeLogging.sdk = true;
    runtimeLogging.eciesLayer = true;
    runtimeLogging.keyExchangeLayer = true;
    runtimeLogging.remoteLayer = true;
    runtimeLogging.serviceLayer = true;
  }
}
