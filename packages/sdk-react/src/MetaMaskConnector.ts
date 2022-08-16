import { MetaMaskConnector as DefaultMetaMaskConnector } from 'wagmi/connectors/metaMask';
import MetaMaskSDK from '@metamask/sdk';

const sdk = new MetaMaskSDK({
  injectProvider: false,
});

class MetaMaskConnector extends DefaultMetaMaskConnector {
  #provider = sdk.getProvider();

  async getProvider() {
    if (!this.#provider) {
      this.#provider = sdk.getProvider();
    }
    return this.#provider;
  }

  getProviderSync() {
    if (!this.#provider) {
      this.#provider = sdk.getProvider();
    }
    return this.#provider;
  }
}

export default MetaMaskConnector;
