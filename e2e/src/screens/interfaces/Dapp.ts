import { ChainablePromiseElement } from 'webdriverio';

export type Dapp = {
  connectButton: ChainablePromiseElement;

  terminateButton: ChainablePromiseElement;

  sendTransactionButton?: ChainablePromiseElement;

  personalSignButton?: ChainablePromiseElement;

  clearUIStateButton?: ChainablePromiseElement;

  switchToLineaSepoliaButton?: ChainablePromiseElement;

  switchToMainnetButton?: ChainablePromiseElement;

  switchToPolygonButton?: ChainablePromiseElement;

  connect(): Promise<void>;
  terminate(): Promise<void>;
  sendTransaction?(): Promise<void>;
  personalSign?(): Promise<void>;
  clearUIState?(): Promise<void>;
  switchToLineaSepolia?(): Promise<void>;
  switchToMainnet?(): Promise<void>;
  switchToPolygon?(): Promise<void>;
  isDappConnected(): Promise<boolean>;
};
