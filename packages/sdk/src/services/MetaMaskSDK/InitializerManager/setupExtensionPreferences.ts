import { TrackingEvents } from '@metamask/sdk-communication-layer';
import { STORAGE_PROVIDER_TYPE } from '../../../config';
import { MetaMaskSDK } from '../../../sdk';
import { getBrowserExtension } from '../../../utils/get-browser-extension';
import { Ethereum } from '../../Ethereum';

/**
 * Sets up the extension preferences for the MetaMask SDK instance.
 *
 * This function tries to identify if the MetaMask extension is installed and active in the browser.
 * If the extension is found, the relevant MetaMask SDK instance properties are updated accordingly.
 * The function also checks if the SDK is running in MetaMask's in-app browser on mobile devices.
 * Based on these checks, the function returns an object containing information about whether the
 * extension is preferred, whether the initialization process should return early, and the detected
 * MetaMask browser extension.
 *
 * @param {MetaMaskSDK} instance - The MetaMaskSDK instance for which extension preferences will be set up.
 * @returns {Object} An object containing the following properties:
 *   - preferExtension: Boolean indicating if the extension is preferred.
 *   - shouldReturn: Boolean indicating if the initialization process should return early.
 *   - metamaskBrowserExtension: The detected MetaMask browser extension, if any.
 * @async
 */
export async function setupExtensionPreferences(instance: MetaMaskSDK) {
  const { options } = instance;

  const developerMode = options.logging?.developerMode === true;

  let metamaskBrowserExtension;
  let preferExtension = false;
  let shouldReturn = false;

  if (
    typeof window !== 'undefined' &&
    window.ethereum &&
    !instance.platformManager?.isMetaMaskMobileWebView()
  ) {
    preferExtension =
      localStorage.getItem(STORAGE_PROVIDER_TYPE) === 'extension';

    try {
      metamaskBrowserExtension = await getBrowserExtension({
        mustBeMetaMask: true,
      });

      window.extension = metamaskBrowserExtension;
    } catch (err) {
      // Ignore error if metamask extension not found
      delete window.extension;
    }
    Ethereum.destroy();
  } else if (instance.platformManager?.isMetaMaskMobileWebView()) {
    instance.analytics?.send({ event: TrackingEvents.SDK_USE_INAPP_BROWSER });
    instance.activeProvider = window.ethereum;
    instance._initialized = true;

    shouldReturn = true;
  }

  if (metamaskBrowserExtension && options.extensionOnly) {
    if (developerMode) {
      console.warn(`EXTENSION ONLY --- prevent sdk initialization`);
    }
    instance.analytics?.send({ event: TrackingEvents.SDK_USE_EXTENSION });
    instance.activeProvider = metamaskBrowserExtension;
    instance.extensionActive = true;
    instance._initialized = true;

    shouldReturn = true;
  }

  return {
    preferExtension,
    shouldReturn,
    metamaskBrowserExtension,
  };
}
