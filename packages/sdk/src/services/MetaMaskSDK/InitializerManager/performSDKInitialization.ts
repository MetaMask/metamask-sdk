import {
  CommunicationLayerPreference,
  EventType,
} from '@metamask/sdk-communication-layer';
import { MetaMaskSDK } from '../../../sdk';
import { PROVIDER_UPDATE_TYPE } from '../../../types/ProviderUpdateType';
import { handleAutoAndExtensionConnections } from './handleAutoAndExtensionConnections';
import { initializeProviderAndEventListeners } from './initializeProviderAndEventListeners';
import { setupAnalytics } from './setupAnalytics';
import { setupDappMetadata } from './setupDappMetadata';
import { setupExtensionPreferences } from './setupExtensionPreferences';
import { setupPlatformManager } from './setupPlatformManager';
import { setupRemoteConnectionAndInstaller } from './setupRemoteConnectionAndInstaller';
import { setupStorageManager } from './setupStorage';
import { setupInfuraProvider } from './setupInfuraProvider';
import { setupReadOnlyRPCProviders } from './setupReadOnlyRPCProviders';
import { initializeI18next } from './initializeI18next';

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
export async function performSDKInitialization(instance: MetaMaskSDK) {
  const { options } = instance;

  // Set default options if not provided
  options.logging = options.logging ?? {};
  options.communicationLayerPreference =
    options.communicationLayerPreference ?? CommunicationLayerPreference.SOCKET;

  // TODO: it need to be removed and it was added for backward compatibility
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (options.enableDebug !== undefined) {
    console.warn('enableDebug is removed. Please use enableAnalytics instead.');
  }

  options.enableAnalytics = options.enableAnalytics ?? true;
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

  await initializeI18next(instance);

  await setupPlatformManager(instance);

  await setupAnalytics(instance);

  await setupStorageManager(instance);

  await setupDappMetadata(instance);

  await setupInfuraProvider(instance);

  await setupReadOnlyRPCProviders(instance);

  const { metamaskBrowserExtension, preferExtension, shouldReturn } =
    await setupExtensionPreferences(instance);

  if (shouldReturn) {
    return;
  }

  await setupRemoteConnectionAndInstaller(instance, metamaskBrowserExtension);

  await initializeProviderAndEventListeners(instance);
  await handleAutoAndExtensionConnections(instance, preferExtension);

  instance.emit(EventType.PROVIDER_UPDATE, PROVIDER_UPDATE_TYPE.INITIALIZED);
}
