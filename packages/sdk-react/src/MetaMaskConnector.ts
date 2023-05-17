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

  // async connect({ chainId }: { chainId?: number }): Promise<{
  //   account: string;
  //   chain: { id: number; unsupported: boolean };
  //   provider: Ethereum;
  // }> {
  //   const result = await super.connect({ chainId });
  //   return result;
  // }

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
