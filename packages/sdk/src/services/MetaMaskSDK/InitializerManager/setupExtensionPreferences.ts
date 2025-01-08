import { TrackingEvents } from '@metamask/sdk-communication-layer';
import { logger } from '../../../utils/logger';
import { SDKProvider } from '../../../provider/SDKProvider';
import {
  EXTENSION_EVENTS,
  RPC_METHODS,
  STORAGE_PROVIDER_TYPE,
} from '../../../config';
import { MetaMaskSDK } from '../../../sdk';
import { getBrowserExtension } from '../../../utils/get-browser-extension';
import { Ethereum } from '../../Ethereum';
import { wrapExtensionProvider } from '../../../provider/wrapExtensionProvider';

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
        sdkInstance: instance,
      });

      window.extension = metamaskBrowserExtension;

      // Propagate browser extension events onto the main provider since some clients only subscribe to the main mobile provider.
      metamaskBrowserExtension.on(EXTENSION_EVENTS.CHAIN_CHANGED, (chainId) => {
        logger(
          `[MetaMaskSDK: setupExtensionPreferences()] PROPAGATE chainChanged chainId=${chainId}`,
        );

        const hasMobileProvider = Boolean(instance.sdkProvider);

        if (hasMobileProvider) {
          instance
            .getMobileProvider()
            .emit(EXTENSION_EVENTS.CHAIN_CHANGED, chainId);
        }
      });

      metamaskBrowserExtension.on(
        EXTENSION_EVENTS.ACCOUNTS_CHANGED,
        async (accounts) => {
          logger(
            `[MetaMaskSDK: setupExtensionPreferences()] PROPAGATE accountsChanged accounts=${accounts}`,
          );

          const hasMobileProvider = Boolean(instance.sdkProvider);

          const isExtensionActive = Boolean(instance.extensionActive);

          if (hasMobileProvider) {
            instance
              .getMobileProvider()
              .emit(EXTENSION_EVENTS.ACCOUNTS_CHANGED, accounts);
          }

          if (isExtensionActive && (accounts as string[])?.length === 0) {
            const getPermissionsResponse = await instance
              .getProvider()
              ?.request({
                method: RPC_METHODS.WALLET_GETPERMISSIONS,
                params: [],
              });

            const permissions = getPermissionsResponse as {
              caveats: { type: string; value: string[] }[];
              parentCapability: string;
            }[];

            if (permissions.length === 0) {
              try {
                await instance.terminate();
              } catch (error) {
                logger(
                  `[MetaMaskSDK: setupExtensionPreferences()] error terminating on permissions revoked`,
                  error,
                );
              }
            }
          }
        },
      );

      metamaskBrowserExtension.on(EXTENSION_EVENTS.DISCONNECT, (error) => {
        logger(
          `[MetaMaskSDK: setupExtensionPreferences()] PROPAGATE disconnect error=${error}`,
        );

        const hasMobileProvider = Boolean(instance.sdkProvider);

        if (hasMobileProvider) {
          instance.getMobileProvider().emit(EXTENSION_EVENTS.DISCONNECT, error);
        }
      });

      metamaskBrowserExtension.on(EXTENSION_EVENTS.CONNECT, (args) => {
        logger(
          `[MetaMaskSDK: setupExtensionPreferences()] PROPAGATE connect args=${args}`,
        );

        const hasMobileProvider = Boolean(instance.sdkProvider);

        if (hasMobileProvider) {
          instance.getMobileProvider().emit(EXTENSION_EVENTS.CONNECT, args);
        }
      });

      metamaskBrowserExtension.on(EXTENSION_EVENTS.CONNECTED, (args) => {
        logger(
          '[MetaMaskSDK: setupExtensionPreferences()] PROPAGATE connected',
          args,
        );

        const hasMobileProvider = Boolean(instance.sdkProvider);

        if (hasMobileProvider) {
          instance.getMobileProvider().emit(EXTENSION_EVENTS.CONNECTED, args);
        }
      });
    } catch (err) {
      // Ignore error if metamask extension not found
      window.extension = undefined;
    }
    Ethereum.destroy();
  } else if (instance.platformManager?.isMetaMaskMobileWebView()) {
    instance.analytics?.send({ event: TrackingEvents.SDK_USE_INAPP_BROWSER });
    // TODO: Remove Force wrapping inpage provider until it implements latest provider interface
    instance.activeProvider = wrapExtensionProvider({
      provider: window.ethereum as any,
      sdkInstance: instance,
    }) as SDKProvider;
    instance._initialized = true;

    shouldReturn = true;
  }

  if (metamaskBrowserExtension && options.extensionOnly) {
    logger(
      `[MetaMaskSDK: setupExtensionPreferences()] EXTENSION ONLY --- prevent sdk initialization`,
    );

    instance.analytics?.send({ event: TrackingEvents.SDK_USE_EXTENSION });
    instance.activeProvider = metamaskBrowserExtension as SDKProvider; // TODO should be MetaMaskInPageProvider
    instance.extensionActive = true;
    instance.extension = metamaskBrowserExtension;
    instance._initialized = true;

    shouldReturn = true;
  }

  return {
    preferExtension,
    shouldReturn,
    metamaskBrowserExtension,
  };
}
