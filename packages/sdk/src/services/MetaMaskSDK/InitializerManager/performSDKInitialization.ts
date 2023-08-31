import { CommunicationLayerPreference } from '@metamask/sdk-communication-layer';
import { MetaMaskSDK } from '../../../sdk';
import { handleAutoAndExtensionConnections } from './handleAutoAndExtensionConnections';
import { initializeProviderAndEventListeners } from './initializeProviderAndEventListeners';
import { setupAnalytics } from './setupAnalytics';
import { setupDappMetadata } from './setupDappMetadata';
import { setupExtensionPreferences } from './setupExtensionPreferences';
import { setupPlatformManager } from './setupPlatformManager';
import { setupRemoteConnectionAndInstaller } from './setupRemoteConnectionAndInstaller';
import { setupStorageManager } from './setupStorage';

/**
 * Performs the complete initialization of the MetaMask SDK instance.
 *
 * This function sets up the SDK with a series of asynchronous tasks, including:
 * 1. Setting up default options and logging preferences.
 * 2. Configuring the platform manager.
 * 3. Initializing analytics.
 * 4. Setting up storage manager.
 * 5. Configuring Dapp metadata.
 * 6. Handling extension preferences.
 * 7. Setting up remote connections and installer.
 * 8. Initializing the provider and event listeners.
 * 9. Handling automatic and extension-based connections.
 *
 * @param instance The MetaMaskSDK instance to be fully initialized.
 * @returns void
 * @async
 */
export async function performSDKInitialization(instance: MetaMaskSDK) {
  const { options } = instance;

  // Set default options if not provided
  options.logging = options.logging ?? {};
  options.communicationLayerPreference =
    options.communicationLayerPreference ?? CommunicationLayerPreference.SOCKET;
  options.enableDebug = options.enableDebug ?? true;
  options.injectProvider = options.injectProvider ?? true;
  options.shouldShimWeb3 = options.shouldShimWeb3 ?? true;
  options.useDeeplink = options.useDeeplink ?? false;
  options.storage = options.storage ?? {
    enabled: true,
  };

  const developerMode = options.logging?.developerMode === true;
  instance.debug = options.logging?.sdk || developerMode;
  if (instance.debug) {
    console.debug(`SDK::_doInit() now`, instance.options);
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

  await setupPlatformManager(instance);

  await setupAnalytics(instance);

  await setupStorageManager(instance);

  await setupDappMetadata(instance);

  const { metamaskBrowserExtension, preferExtension, shouldReturn } =
    await setupExtensionPreferences(instance);

  if (shouldReturn) {
    return;
  }

  await setupRemoteConnectionAndInstaller(instance, metamaskBrowserExtension);

  await initializeProviderAndEventListeners(instance);
  await handleAutoAndExtensionConnections(instance, preferExtension);
}
