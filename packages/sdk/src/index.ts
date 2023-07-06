import { MetaMaskSDK, MetaMaskSDKOptions } from './sdk';
import type { SDKLoggingOptions } from './types/SDKLoggingOptions';
import { SDKProvider } from './provider/SDKProvider';

export * from '@metamask/sdk-communication-layer';
export type { MetaMaskSDKOptions, SDKLoggingOptions };
export { MetaMaskSDK, SDKProvider };
export default MetaMaskSDK;
