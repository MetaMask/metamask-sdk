import { CommunicationLayerPreference } from '@metamask/sdk-communication-layer';
import { MetaMaskInstaller } from '../../../Platform/MetaMaskInstaller';
import { PlatformManager } from '../../../Platform/PlatfformManager';
import initializeMobileProvider from '../../../provider/initializeMobileProvider';
import { MetaMaskSDK } from '../../../sdk';
import { initEventListeners } from './initEventListeners';

/**
 * Initializes the MetaMask provider and event listeners for the SDK instance.
 *
 * This function first initializes the active provider by calling 'initializeProvider' with relevant options.
 * It then sets up event listeners for the SDK instance by calling 'initEventListeners'.
 *
 * @param instance The MetaMaskSDK instance for which the provider and event listeners will be initialized.
 * @returns void
 * @async
 */
export async function initializeProviderAndEventListeners(
  instance: MetaMaskSDK,
) {
  const { options } = instance;

  // Inject our provider into window.ethereum
  instance.activeProvider = initializeMobileProvider({
    communicationLayerPreference:
      options.communicationLayerPreference ??
      CommunicationLayerPreference.SOCKET,
    platformManager: instance.platformManager as PlatformManager,
    sdk: instance,
    checkInstallationOnAllCalls: options.checkInstallationOnAllCalls as boolean,
    injectProvider: options.injectProvider ?? true,
    shouldShimWeb3: options.shouldShimWeb3 ?? true,
    installer: instance.installer as MetaMaskInstaller,
    remoteConnection: instance.remoteConnection,
    debug: instance.debug,
  });

  initEventListeners(instance);
}
