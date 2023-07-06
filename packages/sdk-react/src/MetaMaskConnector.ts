import { MetaMaskConnector as DefaultMetaMaskConnector } from 'wagmi/connectors/metaMask';
import { Chain } from 'wagmi';
import { MetaMaskSDK } from '@metamask/sdk';
import { W } from '@wagmi/connectors/dist/base-5cce2182';

interface Options {
  chains?: Chain[];
  sdk: MetaMaskSDK;
}
class MetaMaskConnector extends DefaultMetaMaskConnector {
  sdk: MetaMaskSDK;

  #provider: any;

  #connectRequest?: Promise<{
    account: `0x${string}`;
    chain: { id: number; unsupported: boolean };
    provider: W;
  }>;

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
    this.#connectRequest = undefined;
    this.sdk.terminate();
  }

  async connect(
    _params?: { chainId?: number | undefined } | undefined,
  ): Promise<{
    account: `0x${string}`;
    chain: { id: number; unsupported: boolean };
    provider: W;
  }> {
    // return super.connect(_params);
    // // Replace previous implementation that was calling super.connect(_params)
    if (this.#connectRequest) {
      return this.#connectRequest;
    }

    this.#connectRequest = new Promise((resolve, reject) => {
      this.#provider
        .request({
          method: 'eth_requestAccounts',
          params: [],
        })
        .then((accounts: `0x${string}`[]) => {
          const selectedAccount = accounts?.[0] || '';
          resolve({
            account: selectedAccount,
            chain: {
              id: parseInt(this.#provider.chainId, 16),
              unsupported: false,
            },
            provider: this.#provider,
          });
        })
        .catch(reject);
    });
    return this.#connectRequest;
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
