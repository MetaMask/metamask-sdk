import {
  SendAnalytics,
  TrackingEvents,
} from '@metamask/sdk-communication-layer';
import { STORAGE_PROVIDER_TYPE } from '../../../config';
import { MetaMaskSDK } from '../../../sdk';
import { connectWithExtensionProvider } from '../ProviderManager';
import packageJson from '../../../../package.json';

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
    if (instance.debug) {
      console.debug(
        `SDK::performSDKInitialization) preferExtension is detected -- connect with it.`,
      );
    }

    SendAnalytics(
      {
        id: instance.remoteConnection?.state.connector?.state.channelId ?? '',
        event: TrackingEvents.SDK_EXTENSION_UTILIZED,
        ...instance.remoteConnection?.state.connector?.state.originatorInfo,
        commLayer:
          instance.remoteConnection?.state.communicationLayerPreference,
        sdkVersion:
          instance.remoteConnection?.state.connector?.state.sdkVersion,
        walletVersion:
          instance.remoteConnection?.state.connector?.state.walletInfo?.version,
        commLayerVersion: packageJson.version,
      },
      instance.remoteConnection?.state.connector?.state
        .communicationServerUrl as string,
    ).catch((_err) => {
      console.warn(`Can't send the SDK_EXTENSION_UTILIZED analytics event...`);
    });

    connectWithExtensionProvider(instance).catch((_err) => {
      console.warn(`Can't connect with MetaMask extension...`);
      // Clean preferences
      localStorage.removeItem(STORAGE_PROVIDER_TYPE);
    });
  } else if (options.checkInstallationImmediately) {
    if (instance.platformManager?.isDesktopWeb()) {
      if (instance.debug) {
        console.debug(
          `SDK::performSDKInitialization) checkInstallationImmediately`,
        );
      }

      // Don't block /await initialization on autoconnect
      instance.connect().catch((_err) => {
        // ignore error on autoconnect
        if (instance.debug) {
          console.warn(`error during autoconnect`, _err);
        }
      });
    } else {
      console.warn(
        `SDK::performSDKInitialization) checkInstallationImmediately --- IGNORED --- only for web desktop`,
      );
    }
  }

  instance._initialized = true;
}
