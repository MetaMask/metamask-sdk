import { PlatformManager } from '../../../Platform/PlatfformManager';
import { MetaMaskSDK } from '../../../sdk';

/**
 * Initializes and sets up the PlatformManager for the MetaMaskSDK instance.
 *
 * This function constructs a new PlatformManager with various settings, such as
 * deep linking preferences, wake lock status, and debug mode, based on the provided
 * options within the MetaMaskSDK instance. The initialized PlatformManager is then
 * stored back into the MetaMaskSDK instance for further use.
 *
 * @param instance The current instance of the MetaMaskSDK, which contains user-defined or default options.
 * @returns {Promise<void>} A Promise that resolves when the PlatformManager has been successfully set up.
 */
export async function setupPlatformManager(instance: MetaMaskSDK) {
  const { options } = instance;

  instance.platformManager = new PlatformManager({
    useDeepLink: options.useDeeplink ?? false,
    preferredOpenLink: options.openDeeplink,
    debug: instance.debug,
  });
}
