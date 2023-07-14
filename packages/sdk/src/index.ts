import { MetaMaskSDK, MetaMaskSDKOptions, PROVIDER_UPDATE_TYPE } from './sdk';
import type { SDKLoggingOptions } from './types/SDKLoggingOptions';
import { SDKProvider } from './provider/SDKProvider';

export * from '@metamask/sdk-communication-layer';
export type { MetaMaskSDKOptions, SDKLoggingOptions };
export { MetaMaskSDK, SDKProvider, PROVIDER_UPDATE_TYPE };
export default MetaMaskSDK;
