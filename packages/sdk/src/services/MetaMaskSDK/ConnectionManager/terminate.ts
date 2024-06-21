import { EventType } from '@metamask/sdk-communication-layer';
import {
  STORAGE_DAPP_CHAINID,
  STORAGE_DAPP_SELECTED_ADDRESS,
  STORAGE_PROVIDER_TYPE,
} from '../../../config';
import { MetaMaskSDK } from '../../../sdk';
import { PROVIDER_UPDATE_TYPE } from '../../../types/ProviderUpdateType';
import { logger } from '../../../utils/logger';

const hasLocalStoage = typeof window !== 'undefined' && window.localStorage;

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

  if (hasLocalStoage) {
    window.localStorage.removeItem(STORAGE_PROVIDER_TYPE);
    window.localStorage.removeItem(STORAGE_DAPP_CHAINID);
    window.localStorage.removeItem(STORAGE_DAPP_SELECTED_ADDRESS);
  }

  // check if connected with extension provider
  // if it is, disconnect from it and switch back to injected provider
  if (instance.extensionActive) {
    if (instance.options.extensionOnly) {
      logger(
        `[MetaMaskSDK: terminate()] extensionOnly --- prevent switching providers`,
      );
      return;
    }

    // Optional: could Call wallet_revokePermissions to revoke the permissions granted to the dapp but it makes the experience awkward
    // as the user has to manually deselect the account from the list. Choose to not implement for now.

    // Re-use default extension provider as default
    instance.activeProvider = instance.sdkProvider;
    window.ethereum = instance.activeProvider;
    instance.extensionActive = false;
    instance.emit(EventType.PROVIDER_UPDATE, PROVIDER_UPDATE_TYPE.TERMINATE);
    return;
  }

  instance.emit(EventType.PROVIDER_UPDATE, PROVIDER_UPDATE_TYPE.TERMINATE);
  logger(
    `[MetaMaskSDK: terminate()] remoteConnection=${instance.remoteConnection}`,
  );

  // Only disconnect if the connection is active
  instance.remoteConnection?.disconnect({
    terminate: true,
    sendMessage: true,
  });
}
