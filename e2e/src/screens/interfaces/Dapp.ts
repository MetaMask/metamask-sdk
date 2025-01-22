import { ChainablePromiseElement } from 'webdriverio';

import { UnityDappElement } from '@util/types';

export type Dapp = {
  connectButton: ChainablePromiseElement | UnityDappElement;

  terminateButton: ChainablePromiseElement | UnityDappElement;

  signTypedDataV3Button?: ChainablePromiseElement | UnityDappElement;

  signTypedDataV4Button?: ChainablePromiseElement | UnityDappElement;

  sendTransactionButton?: ChainablePromiseElement | UnityDappElement;

  personalSignButton?: ChainablePromiseElement | UnityDappElement;

  connect(): Promise<void>;
  signTypedDataV3?(): Promise<void>;
  signTypedDataV4?(): Promise<void>;
  personalSign?(): Promise<void>;
  sendTransaction?(): Promise<void>;
  isDappConnected(): Promise<boolean>;
  terminate(): Promise<void>;
};
