import { MetaMaskConnector as DefaultMetaMaskConnector } from 'wagmi/connectors/metaMask';
// eslint-disable-next-line import/named
import { Chain } from 'wagmi';
// eslint-disable-next-line import/named
import { MetaMaskSDK } from '@metamask/sdk';

type Options = {
  chains?: Chain[];
  sdk: MetaMaskSDK;
};
class MetaMaskConnector extends DefaultMetaMaskConnector {
  sdk: MetaMaskSDK;

  #provider: any;

  constructor({ chains, sdk }: Options) {
    super({ chains, options: { shimDisconnect: false } });
    this.sdk = sdk;

    this.#provider = this.sdk.getProvider();
  }

  async getProvider() {
    if (!this.#provider) {
      this.#provider = this.sdk.getProvider();
    }
    return this.#provider;
  }

  async disconnect() {
    this.sdk.terminate({ emitDisconnect: false });
  }

  getSDK() {
    return this.sdk;
  }

  getProviderSync() {
    if (!this.#provider) {
      this.#provider = this.sdk.getProvider();
    }
    return this.#provider;
  }
}

export default MetaMaskConnector;
