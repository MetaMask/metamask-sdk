import { ChainablePromiseElement } from 'webdriverio';

import { UnityDappElement } from '../../types';

export type Dapp = {
  connectButton:
    | ChainablePromiseElement<WebdriverIO.Element>
    | UnityDappElement;

  connect(): Promise<void>;

  signButton: ChainablePromiseElement<WebdriverIO.Element> | UnityDappElement;

  sign(): Promise<void>;

  terminateButton:
    | ChainablePromiseElement<WebdriverIO.Element>
    | UnityDappElement;

  terminate(): Promise<void>;
};
