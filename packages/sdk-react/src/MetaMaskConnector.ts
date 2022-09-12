import { MetaMaskConnector as DefaultMetaMaskConnector } from 'wagmi/connectors/metaMask';
// eslint-disable-next-line import/named
import { Chain } from 'wagmi';
import MetaMaskSDK, {
  // eslint-disable-next-line import/named
  MetaMaskSDKOptions as MetaMaskSDKOptionsProps,
} from '@metamask/sdk';

type Options = {
  chains?: Chain[];
  MetaMaskSDKOptions?: MetaMaskSDKOptionsProps;
};
class MetaMaskConnector extends DefaultMetaMaskConnector {
  sdk: MetaMaskSDK;

  #provider: any;

  constructor({ MetaMaskSDKOptions, chains }: Options) {
    super({ chains });
    this.sdk = new MetaMaskSDK({
      injectProvider: false,
      ...MetaMaskSDKOptions,
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
