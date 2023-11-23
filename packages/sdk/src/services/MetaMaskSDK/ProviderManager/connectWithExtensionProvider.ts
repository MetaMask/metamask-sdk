import { EventType, TrackingEvents } from '@metamask/sdk-communication-layer';
import { STORAGE_PROVIDER_TYPE } from '../../../config';
import { MetaMaskSDK } from '../../../sdk';
import { PROVIDER_UPDATE_TYPE } from '../../../types/ProviderUpdateType';

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
  if (instance.debug) {
    console.debug(`SDK::connectWithExtensionProvider()`, instance);
  }

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
    if (instance.debug) {
      console.debug(`SDK::connectWithExtensionProvider() accounts`, accounts);
    }
  } catch (err) {
    // ignore error
    console.warn(
      `SDK::connectWithExtensionProvider() can't request accounts error`,
      err,
    );
    return;
  }

  // remember setting for next time (until terminated)
  localStorage.setItem(STORAGE_PROVIDER_TYPE, 'extension');
  // eslint-disable-next-line require-atomic-updates
  instance.extensionActive = true;
  instance.emit(EventType.PROVIDER_UPDATE, PROVIDER_UPDATE_TYPE.EXTENSION);
  instance.analytics?.send({ event: TrackingEvents.SDK_USE_EXTENSION });
}
