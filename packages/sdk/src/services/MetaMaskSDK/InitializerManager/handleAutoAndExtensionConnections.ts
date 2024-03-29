import { TrackingEvents } from '@metamask/sdk-communication-layer';
import { STORAGE_PROVIDER_TYPE } from '../../../config';
import { MetaMaskSDK } from '../../../sdk';
import { logger } from '../../../utils/logger';
import { connectWithExtensionProvider } from '../ProviderManager';

/**
 * Handles automatic and extension-based connections for MetaMask SDK.
 *
 * This function decides between connecting using MetaMask extension or automatically
 * connecting based on the passed parameters and platform conditions. If 'preferExtension' is true,
 * it attempts to connect with the MetaMask extension and falls back to cleaning the preference
 * if the connection fails. If 'checkInstallationImmediately' is set in options, it attempts to auto-connect,
 * but only if the platform is a desktop web environment.
 *
 * @param instance The MetaMaskSDK instance to handle the connection for.
 * @param preferExtension A boolean flag indicating whether to prefer connecting via MetaMask extension.
 * @returns void
 */
export async function handleAutoAndExtensionConnections(
  instance: MetaMaskSDK,
  preferExtension: boolean,
) {
  const { options } = instance;

  if (preferExtension) {
    logger(
      `[MetaMaskSDK: handleAutoAndExtensionConnections()] preferExtension is detected -- connect with it.`,
    );

    instance.analytics?.send({
      event: TrackingEvents.SDK_EXTENSION_UTILIZED,
    });

    connectWithExtensionProvider(instance).catch((_err) => {
      console.warn(`Can't connect with MetaMask extension...`, _err);
      // Clean preferences
      localStorage.removeItem(STORAGE_PROVIDER_TYPE);
    });
  } else if (options.checkInstallationImmediately) {
    if (instance.platformManager?.isDesktopWeb()) {
      logger(
        `[MetaMaskSDK: handleAutoAndExtensionConnections()] checkInstallationImmediately`,
      );

      // Don't block /await initialization on autoconnect
      instance.connect().catch((_err) => {
        // ignore error on autoconnect
        logger(
          `[MetaMaskSDK: handleAutoAndExtensionConnections()] checkInstallationImmediately --- IGNORED --- error on autoconnect _err=${_err}`,
        );
      });
    } else {
      console.warn(
        `[handleAutoAndExtensionConnections()] checkInstallationImmediately --- IGNORED --- only for web desktop`,
      );
    }
  }

  instance._initialized = true;
}
