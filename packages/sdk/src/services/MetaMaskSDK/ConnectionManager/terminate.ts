import { EventType } from '@metamask/sdk-communication-layer';
import { STORAGE_PROVIDER_TYPE } from '../../../config';
import { MetaMaskSDK } from '../../../sdk';
import { PROVIDER_UPDATE_TYPE } from '../../../types/ProviderUpdateType';

/**
 * Terminates the MetaMask connection, switching back to the injected provider if connected via extension.
 *
 * This function first checks if the SDK is running within MetaMask Mobile WebView; if it is,
 * no termination is performed. If connected via extension, it removes the active extension provider
 * and switches back to the SDK's default provider. Finally, it emits a PROVIDER_UPDATE event of type TERMINATE.
 *
 * @param instance The MetaMaskSDK instance whose connection should be terminated.
 * @returns void
 * @emits EventType.PROVIDER_UPDATE with payload PROVIDER_UPDATE_TYPE.TERMINATE when the provider is updated.
 */
export function terminate(instance: MetaMaskSDK) {
  // nothing to do on inapp browser.
  if (instance.platformManager?.isMetaMaskMobileWebView()) {
    return;
  }

  // check if connected with extension provider
  // if it is, disconnect from it and switch back to injected provider
  if (instance.extensionActive) {
    localStorage.removeItem(STORAGE_PROVIDER_TYPE);
    if (instance.options.extensionOnly) {
      if (instance.debug) {
        console.warn(
          `SDK::terminate() extensionOnly --- prevent switching providers`,
        );
      }

      return;
    }
    // Re-use default extension provider as default
    instance.activeProvider = instance.sdkProvider;
    window.ethereum = instance.activeProvider;
    instance.extensionActive = false;
    instance.emit(EventType.PROVIDER_UPDATE, PROVIDER_UPDATE_TYPE.TERMINATE);
    return;
  }

  instance.emit(EventType.PROVIDER_UPDATE, PROVIDER_UPDATE_TYPE.TERMINATE);
  if (instance.debug) {
    console.debug(`SDK::terminate()`, instance.remoteConnection);
  }

  // Only disconnect if the connection is active
  instance.remoteConnection?.disconnect({
    terminate: true,
    sendMessage: true,
  });
}
