import MetaMaskProvider, { SDKContext, SDKState } from './MetaMaskProvider';
import {
  SDKConfigProvider,
  SDKConfigProviderProps,
  SDKConfigContext,
  SDKConfigContextProps,
} from './SDKConfigProvider';

export * from './MetaMaskHooks';

export * from '@metamask/sdk';

export type {
  SDKConfigProviderProps,
  SDKState,
  SDKConfigContextProps,
};

export {
  MetaMaskProvider,
  SDKContext,
  SDKConfigProvider,
  SDKConfigContext,
};
