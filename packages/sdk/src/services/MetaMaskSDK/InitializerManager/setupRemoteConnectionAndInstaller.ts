import { CommunicationLayerPreference } from '@metamask/sdk-communication-layer';
import { MetaMaskInstaller } from '../../../Platform/MetaMaskInstaller';
import { MetaMaskSDK } from '../../../sdk';
import { RemoteConnection } from '../../RemoteConnection';
import { Analytics } from '../../Analytics';
import { PlatformManager } from '../../../Platform/PlatfformManager';
import { connectWithExtensionProvider } from '../ProviderManager/connectWithExtensionProvider';

/**
 * Initializes and sets up both the RemoteConnection and MetaMaskInstaller for the MetaMaskSDK instance.
 *
 * This function constructs a new RemoteConnection with various settings, such as communication layer preference,
 * analytics, and metadata based on the provided options within the MetaMaskSDK instance. It also sets up
 * MetaMaskInstaller which is responsible for handling MetaMask installations. The initialized RemoteConnection
 * and MetaMaskInstaller are stored back into the MetaMaskSDK instance for further use.
 *
 * @param instance The current instance of the MetaMaskSDK, which contains user-defined or default options.
 * @param metamaskBrowserExtension An optional parameter representing the MetaMask browser extension instance, if available.
 * @returns {Promise<void>} A Promise that resolves when both the RemoteConnection and MetaMaskInstaller have been successfully set up.
 */
export async function setupRemoteConnectionAndInstaller(
  instance: MetaMaskSDK,
  metamaskBrowserExtension: any,
) {
  const { options } = instance;

  const runtimeLogging = { ...options.logging };

  instance.remoteConnection = new RemoteConnection({
    communicationLayerPreference:
      options.communicationLayerPreference ??
      CommunicationLayerPreference.SOCKET,
    analytics: instance.analytics as Analytics,
    dappMetadata: options.dappMetadata,
    _source: options._source,
    enableDebug: options.enableDebug ?? true,
    timer: options.timer,
    sdk: instance,
    platformManager: instance.platformManager as PlatformManager,
    transports: options.transports,
    communicationServerUrl: options.communicationServerUrl,
    storage: options.storage ?? {
      enabled: true,
    },
    getMetaMaskInstaller: () => {
      // used to prevent circular dependencies
      if (!instance.installer) {
        throw new Error(`Invalid SDK status -- installer not initialized`);
      }
      return instance.installer;
    },
    logging: runtimeLogging,
    connectWithExtensionProvider:
      metamaskBrowserExtension === undefined
        ? undefined
        : () => connectWithExtensionProvider(instance),
    modals: {
      ...options.modals,
      onPendingModalDisconnect: instance.terminate.bind(instance),
    },
  });

  instance.installer = new MetaMaskInstaller({
    preferDesktop: options.preferDesktop ?? false,
    remote: instance.remoteConnection,
    platformManager: instance.platformManager as PlatformManager,
    debug: instance.debug,
  });
}
