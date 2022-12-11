import { MetaMaskConnector as DefaultMetaMaskConnector } from 'wagmi/connectors/metaMask';
// eslint-disable-next-line import/named
import { Chain } from 'wagmi';
// eslint-disable-next-line import/named
import MetaMaskSDK, { MetaMaskSDKOptions } from '@metamask/sdk';

type Options = {
  chains?: Chain[];
  sdkOptions?: MetaMaskSDKOptions;
};
class MetaMaskConnector extends DefaultMetaMaskConnector {
  sdk: MetaMaskSDK;

  #provider: any;

  constructor({ chains, sdkOptions }: Options) {
    super({ chains });
    this.sdk = new MetaMaskSDK({
      injectProvider: false,
      ...sdkOptions,
    });

    this.#provider = this.sdk.getProvider();
  }

  async getProvider() {
    if (!this.#provider) {
      this.#provider = this.sdk.getProvider();
    }
    return this.#provider;
  }

  getProviderSync() {
    if (!this.#provider) {
      this.#provider = this.sdk.getProvider();
    }
    return this.#provider;
  }
}

export default MetaMaskConnector;
