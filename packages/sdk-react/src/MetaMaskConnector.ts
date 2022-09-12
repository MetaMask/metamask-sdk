import { MetaMaskConnector as DefaultMetaMaskConnector } from 'wagmi/connectors/metaMask';
import MetaMaskSDK, {
  MetaMaskSDKOptions as MetaMaskSDKOptionsProps,
} from '@metamask/sdk';
import { Chain } from 'wagmi';

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
