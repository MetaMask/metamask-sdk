import { ChainablePromiseElement } from 'webdriverio';

export type Dapp = {
  connectButton: ChainablePromiseElement;

  terminateButton: ChainablePromiseElement;

  signTypedDataV3Button?: ChainablePromiseElement;

  signTypedDataV4Button?: ChainablePromiseElement;

  sendTransactionButton?: ChainablePromiseElement;

  personalSignButton?: ChainablePromiseElement;

  connect(): Promise<void>;
  signTypedDataV3?(): Promise<void>;
  signTypedDataV4?(): Promise<void>;
  personalSign?(): Promise<void>;
  sendTransaction?(): Promise<void>;
  isDappConnected(): Promise<boolean>;
  terminate(): Promise<void>;
};
