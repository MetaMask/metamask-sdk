import { ChainablePromiseElement } from 'webdriverio';

import { UnityDappElement } from '@/util/types';

export type Dapp = {
  connectButton: ChainablePromiseElement | UnityDappElement;

  connect(): Promise<void>;

  signTypedDataV3Button?: ChainablePromiseElement | UnityDappElement;

  signTypedDataV4Button?: ChainablePromiseElement | UnityDappElement;

  sendTransactionButton?: ChainablePromiseElement | UnityDappElement;

  personalSignButton?: ChainablePromiseElement | UnityDappElement;

  signTypedDataV3?(): Promise<void>;
  signTypedDataV4?(): Promise<void>;
  personalSign?(): Promise<void>;
  sendTransaction?(): Promise<void>;

  terminateButton: ChainablePromiseElement | UnityDappElement;

  terminate(): Promise<void>;
};
