import { Linking, NativeModules } from 'react-native';
import { MetaMaskSDKOptions } from './MetaMaskProvider';
const { MetaMaskReactNativeSdk } = NativeModules;

interface MetaMaskSDKNativeModuleOptions {
  dappName: string;
  dappUrl: string;
  dappIconUrl: string;
  dappScheme: string;
  infuraAPIKey: string;
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
export const request = async <Type>(req: RequestArguments): Promise<Type> => {
  return MetaMaskReactNativeSdk.request(req);
};

/**
 * Sends multiple requests to MetaMask in a batch.
 *
 * @param requests - An array of request arguments.
 * @returns A Promise that resolves with an array of results from the RPC methods,
 * or rejects if an error is encountered.
 */
export const batchRequest = async (requests: RequestArguments[]): Promise<unknown[]> => {
  return MetaMaskReactNativeSdk.request(requests);
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

export const terminate = async (): Promise<void> => {
  return MetaMaskReactNativeSdk.clearSession();
};


export function setupDeeplinkHandling() {
  const handleOpenURL = (event: any) => {
    // Handle the URL event here
    console.log('Received URL:', event.url);
    MetaMaskReactNativeSdk.handleDeepLink(event.url);
  };

  // Add event listener for URL events
  Linking.addEventListener('url', handleOpenURL);
}


export function initializeSDK(sdkOptions: MetaMaskSDKOptions) {
  const options: MetaMaskSDKNativeModuleOptions = {
    dappName: sdkOptions.dappMetadata.name,
    dappUrl: sdkOptions.dappMetadata.url,
    dappIconUrl: sdkOptions.dappMetadata.iconUrl,
    dappScheme: sdkOptions.dappMetadata.scheme,
    infuraAPIKey: sdkOptions.infuraAPIKey,
  };

  MetaMaskReactNativeSdk.initialize(options);
  setupDeeplinkHandling();
}
