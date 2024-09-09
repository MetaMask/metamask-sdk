import { Linking, NativeModules, Platform } from 'react-native';
import { MetaMaskSDKOptions } from './MetaMaskProvider';

const { MetaMaskReactNativeSdk } = NativeModules;

interface MetaMaskSDKNativeModuleOptions {
  dappName: string;
  dappUrl: string;
  dappIconUrl: string;
  dappScheme: string;
  infuraAPIKey?: string;
  apiVersion: string;
}

export interface RequestArguments {
  /** The RPC method to request. */
  method: string;
  /** The params of the RPC method, if any. */
  params?: unknown[] | Record<string, unknown>;
}

/**
 * Connects to MetaMask.
 *
 * @returns A Promise that resolves when the connection is successful.
 */
export const connect = async (): Promise<string> => {
  return MetaMaskReactNativeSdk.connect();
};

/**
 * Connects to MetaMask and signs a message.
 *
 * @param message - The message to sign.
 * @returns A Promise that resolves with the signed message.
 */
export const connectAndSign = async (message: string): Promise<string> => {
  return MetaMaskReactNativeSdk.connectAndSign(message);
};

/**
 * Connects to MetaMask with specific request arguments.
 *
 * @param req - The request arguments.
 * @returns A Promise that resolves when the connection is successful.
 */
export const connectWith = async (req: RequestArguments): Promise<string> => {
  return MetaMaskReactNativeSdk.connectWith(req);
};

/**
 * Sends a request to MetaMask.
 *
 * @param req - The request arguments.
 * @returns A Promise that resolves with the result of the RPC method,
 * or rejects if an error is encountered.
 */
export const request = async (req: RequestArguments): Promise<unknown> => {
  return MetaMaskReactNativeSdk.request(req);
};

/**
 * Sends multiple requests to MetaMask in a batch.
 *
 * @param requests - An array of request arguments.
 * @returns A Promise that resolves with an array of results from the RPC methods,
 * or rejects if an error is encountered.
 */
export const batchRequest = async (
  requests: RequestArguments[],
): Promise<unknown[]> => {
  return MetaMaskReactNativeSdk.batchRequest(requests);
};

/**
 * Disconnects from MetaMask.
 *
 * @returns A Promise that resolves when the disconnection is successful.
 */
export const disconnect = async (): Promise<void> => {
  return MetaMaskReactNativeSdk.disconnect();
};

/**
 * Gets the current chain ID from MetaMask.
 *
 * @returns A Promise that resolves with the current chain ID.
 */
export const getChainId = (): Promise<string> => {
  return MetaMaskReactNativeSdk.chainId();
};

/**
 * Gets the selected address from MetaMask.
 *
 * @returns A Promise that resolves with the selected address.
 */
export const getSelectedAddress = (): Promise<string> => {
  return MetaMaskReactNativeSdk.selectedAddress();
};

/**
 * Terminates the current session with MetaMask.
 *
 * @returns A Promise that resolves when the session is cleared.
 */
export const terminate = async (): Promise<void> => {
  return MetaMaskReactNativeSdk.clearSession();
};

/**
 * Sets up deep link handling for MetaMask.
 * Listens for URL events and passes them to the MetaMask SDK.
 */
export function setupDeeplinkHandling() {
  if (Platform.OS === 'ios') {
    const handleOpenURL = (event: any) => {
      const { url } = event;

      try {
        if (!url || typeof url !== 'string') {
          return;
        }

        const urlParts = url.split('://');

        if (urlParts.length < 2) {
          return;
        }

        const hostParts = urlParts[1].split('?');
        if (hostParts.length === 0 || !hostParts[0]) {
          return;
        }

        const host = hostParts[0];

        // Only listen for metamask urls
        if (host === 'mmsdk') {
          // Handle the URL event here
          MetaMaskReactNativeSdk.handleDeepLink(url);
        }
      } catch (error) {
        console.error(
          `MetaMaskReactNativeSdk.handleOpenURL() => Error handling URL ${url} `,
          error,
        );
      }
    };

    // Add event listener for URL events
    Linking.addEventListener('url', handleOpenURL);
  }
}

/**
 * Initializes the MetaMask SDK with the provided options and sets up deep link handling.
 *
 * @param sdkOptions - The options for initializing the SDK.
 */
export function initializeSDK(sdkOptions: MetaMaskSDKOptions) {
  const options: MetaMaskSDKNativeModuleOptions = {
    dappName: sdkOptions.dappMetadata.name,
    dappUrl: sdkOptions.dappMetadata.url,
    dappIconUrl: sdkOptions.dappMetadata.iconUrl,
    dappScheme: sdkOptions.dappMetadata.scheme,
    infuraAPIKey: sdkOptions.infuraAPIKey,
    apiVersion: '0.8.5',
  };

  MetaMaskReactNativeSdk.initialize(options);
  setupDeeplinkHandling();
}
