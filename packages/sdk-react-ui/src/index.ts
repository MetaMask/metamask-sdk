import {
  useSDK,
  MetaMaskProvider,
  SDKConfigProvider,
  SDKConfigProviderProps,
  SDKContext,
  SDKState,
  SDKConfigContext,
  useSDKConfig,
  SDKConfigContextProps,
} from '@metamask/sdk-react';
import MetaMaskButton from './MetaMaskButton/MetaMaskButton';

export * from './MetaMaskUIProvider';
export * from './hooks/MetaMaskWagmiHooks';

export type {
  SDKConfigProviderProps,
  SDKState,
  SDKConfigContextProps
}

export {
  MetaMaskButton,
  useSDK,
  useSDKConfig,
  SDKConfigProvider,
  MetaMaskProvider,
  SDKContext,
  SDKConfigContext,
};
