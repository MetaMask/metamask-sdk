import { Duplex } from 'stream';
import {
  initializeProvider,
  MetaMaskInpageProvider,
} from '@metamask/providers';

export interface EthereumProps {
  shouldSetOnWindow: boolean;
  connectionStream: Duplex;
  shouldSendMetadata?: boolean;
  shouldShimWeb3: boolean;
}

export class Ethereum {
  private static instance?: Ethereum;

  private provider: MetaMaskInpageProvider;

  private constructor({
    shouldSetOnWindow,
    connectionStream,
    shouldSendMetadata = false,
    shouldShimWeb3,
  }: EthereumProps) {
    console.debug(`[Ethereum] intiialize base provider`);
    // TODO don't use initializeProvider, instead create a custom class extending MetamaskInPageProvider
    // This will prevent errors in RemoteConnectionPostMessageStream when forcing provider._initializeState();
    this.provider = initializeProvider({
      shouldSetOnWindow,
      connectionStream,
      shouldSendMetadata,
      shouldShimWeb3,
    });

    this.provider.on('_initialized', () => {
      const info = {
        chainId: this.provider.chainId,
        isConnected: this.provider.isConnected(),
        isMetaNask: this.provider.isMetaMask,
        selectedAddress: this.provider.selectedAddress,
        networkVersion: this.provider.networkVersion,
      };
      console.log(`provider initialized`, info);
    });
  }

  /**
   * Factory method to initialize an Ethereum service.
   *
   * @param props
   */
  static init(props: EthereumProps) {
    this.instance = new Ethereum(props);
    return this.instance?.provider;
  }

  static destroy() {
    Ethereum.instance = undefined;
  }

  static getInstance() {
    if (!this.instance?.provider) {
      throw new Error(
        'Ethereum instance not intiialized - call Ethereum.factory first.',
      );
    }
    return this.instance;
  }

  static getProvider() {
    if (!this.instance?.provider) {
      throw new Error(
        'Ethereum instance not intiialized - call Ethereum.factory first.',
      );
    }

    return this.instance.provider;
  }
}
