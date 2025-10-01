import { CommunicationLayerPreference } from '@metamask/sdk-communication-layer';
import debug from 'debug';
import { MetaMaskSDK } from '../../../sdk';
import { MetaMaskSDKEvent } from '../../../types/MetaMaskSDKEvents';
import { PROVIDER_UPDATE_TYPE } from '../../../types/ProviderUpdateType';
import { logger } from '../../../utils/logger';
import { handleAutoAndExtensionConnections } from './handleAutoAndExtensionConnections';
import { initializeProviderAndEventListeners } from './initializeProviderAndEventListeners';
import { setupAnalytics } from './setupAnalytics';
import { setupAnalyticsV2 } from './setupAnalyticsV2';
import { setupDappMetadata } from './setupDappMetadata';
import { setupExtensionPreferences } from './setupExtensionPreferences';
import { setupInfuraProvider } from './setupInfuraProvider';
import { setupPlatformManager } from './setupPlatformManager';
import { setupReadOnlyRPCProviders } from './setupReadOnlyRPCProviders';
import { setupRemoteConnectionAndInstaller } from './setupRemoteConnectionAndInstaller';
import { setupStorageManager } from './setupStorage';

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
    debug.enable('MM_SDK');
    console.warn('enableDebug is removed. Please use enableAnalytics instead.');
  }

  options.enableAnalytics = options.enableAnalytics ?? true;
  options.injectProvider = options.injectProvider ?? true;
  options.shouldShimWeb3 = options.shouldShimWeb3 ?? true;
  options.extensionOnly = options.extensionOnly ?? true;
  options.useDeeplink = options.useDeeplink ?? true;
  options.hideReturnToAppNotification =
    options.hideReturnToAppNotification ?? false;

  options.storage = options.storage ?? {
    enabled: true,
  };

  if (options.headless) {
    debug('[MetaMaskSDK: performSDKInitialization()] headless mode enabled');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const noop = () => {};
    const _modals = {
      install: () => {
        return {
          mount: noop,
          unmount: noop,
        };
      },
    };
    const _ui = {
      installer: noop,
    };
    options.modals = _modals;
    options.ui = _ui;
  }

  const developerMode = options.logging?.developerMode === true;
  instance.debug = options.logging?.sdk || developerMode;

  logger('[MetaMaskSDK: performSDKInitialization()] options', instance.options);

  // Make sure to enable all logs if developer mode is on
  const runtimeLogging = { ...options.logging };

  if (developerMode) {
    runtimeLogging.sdk = true;
    runtimeLogging.eciesLayer = true;
    runtimeLogging.keyExchangeLayer = true;
    runtimeLogging.remoteLayer = true;
    runtimeLogging.serviceLayer = true;
    runtimeLogging.plaintext = true;
  }

  await setupPlatformManager(instance);

  await setupAnalytics(instance);

  await setupAnalyticsV2(instance);

  await setupStorageManager(instance);

  await setupDappMetadata(instance);

  await setupInfuraProvider(instance);

  await setupReadOnlyRPCProviders(instance);

  const { metamaskBrowserExtension, preferExtension, shouldReturn } =
    await setupExtensionPreferences(instance);

  if (shouldReturn) {
    logger(
      '[MetaMaskSDK: performSDKInitialization()] shouldReturn=true --- prevent sdk initialization',
    );
    return;
  }

  await setupRemoteConnectionAndInstaller(instance, metamaskBrowserExtension);

  // initialize mobile provider and event listeners
  await initializeProviderAndEventListeners(instance);
  await handleAutoAndExtensionConnections(instance, preferExtension);

  try {
    await instance.remoteConnection?.startConnection({ initialCheck: true });
  } catch (err) {
    console.error(
      `[MetaMaskSDK: setupRemoteConnectionAndInstaller()] Error while checking installation`,
      err,
    );
  }

  instance.emit(
    MetaMaskSDKEvent.ProviderUpdate,
    PROVIDER_UPDATE_TYPE.INITIALIZED,
  );
}
