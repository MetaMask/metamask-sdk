import { ChainablePromiseElement } from 'webdriverio';

import { UnityDappElement } from '../../types';

export type Dapp = {
  connectButton:
    | ChainablePromiseElement<WebdriverIO.Element>
    | UnityDappElement;

  connect(): Promise<void>;

  signTypedDataV3Button?:
    | ChainablePromiseElement<WebdriverIO.Element>
    | UnityDappElement;

  signTypedDataV4Button?:
    | ChainablePromiseElement<WebdriverIO.Element>
    | UnityDappElement;

  sendTransactionButton?:
    | ChainablePromiseElement<WebdriverIO.Element>
    | UnityDappElement;

  personalSignButton?:
    | ChainablePromiseElement<WebdriverIO.Element>
    | UnityDappElement;

  signTypedDataV3?(): Promise<void>;
  signTypedDataV4?(): Promise<void>;
  personalSign?(): Promise<void>;
  sendTransaction?(): Promise<void>;

  terminateButton:
    | ChainablePromiseElement<WebdriverIO.Element>
    | UnityDappElement;

  terminate(): Promise<void>;
};
