import { TrackingEvents } from '@metamask/sdk-communication-layer';
import { STORAGE_PROVIDER_TYPE } from '../../../config';
import { MetaMaskSDK } from '../../../sdk';
import { MetaMaskSDKEvent } from '../../../types/MetaMaskSDKEvents';
import { PROVIDER_UPDATE_TYPE } from '../../../types/ProviderUpdateType';
import { logger } from '../../../utils/logger';

/**
 * Connects the MetaMaskSDK instance to the MetaMask browser extension as the active provider.
 *
 * This function swaps the current active provider of the SDK with the MetaMask browser extension and sets it
 * as the default Ethereum provider in the window object. It then attempts to initialize a connection with
 * the extension by requesting access to the user's accounts.
 *
 * If successful, the function updates the local storage to remember this preference for future sessions. An event
 * and an analytics event are also emitted to indicate that the active provider has been updated to the extension.
 *
 * @param instance The current instance of the MetaMaskSDK, which contains user-defined or default options.
 * @returns {Promise<void>} A Promise that resolves when the connection has been established or an error has been caught.
 */
export async function connectWithExtensionProvider(instance: MetaMaskSDK) {
  logger(`[MetaMaskSDK: connectWithExtensionProvider()] `, instance);

  // save a copy of the instance before it gets overwritten
  instance.sdkProvider = instance.activeProvider;
  instance.activeProvider = window.extension as any;
  // Set extension provider as default on window
  window.ethereum = window.extension as any;

  try {
    // always create initial query to connect the account
    const accounts = await window.extension?.request({
      method: 'eth_requestAccounts',
    });

    logger(
      `[MetaMaskSDK: connectWithExtensionProvider()] accounts=${accounts}`,
    );
  } catch (err) {
    console.warn(
      `[MetaMaskSDK: connectWithExtensionProvider()] can't request accounts error`,
      err,
    );

    // Emit appropriate events for connection rejection/cancellation
    instance.emit(MetaMaskSDKEvent.ConnectWithResponse, { error: err });

    if (instance.options.enableAnalytics) {
      instance.analytics?.send({ event: TrackingEvents.REJECTED });
    }

    // Restore original provider if extension connection failed
    if (instance.sdkProvider) {
      instance.activeProvider = instance.sdkProvider;
      if (typeof window !== 'undefined') {
        window.ethereum = instance.sdkProvider;
      }
    }

    throw err; // Re-throw to allow calling code to handle the error
  }

  // remember setting for next time (until terminated)
  localStorage.setItem(STORAGE_PROVIDER_TYPE, 'extension');
  // eslint-disable-next-line require-atomic-updates
  instance.extensionActive = true;
  instance.emit(
    MetaMaskSDKEvent.ProviderUpdate,
    PROVIDER_UPDATE_TYPE.EXTENSION,
  );

  if (instance.options.enableAnalytics) {
    instance.analytics?.send({ event: TrackingEvents.SDK_USE_EXTENSION });
  }
}
