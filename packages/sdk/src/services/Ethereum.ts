import { Duplex } from 'stream';
import { setGlobalProvider, shimWeb3 } from '@metamask/providers';
import { SDKProvider } from '../provider/SDKProvider';

export interface EthereumProps {
  shouldSetOnWindow: boolean;
  connectionStream: Duplex;
  shouldSendMetadata?: boolean;
  shouldShimWeb3: boolean;
  debug: boolean;
}

export class Ethereum {
  private static instance?: Ethereum;

  private provider: SDKProvider;

  private debug = false;

  private constructor({
    shouldSetOnWindow,
    connectionStream,
    shouldSendMetadata = false,
    shouldShimWeb3,
    debug = false,
  }: EthereumProps) {
    const provider = new SDKProvider({
      connectionStream,
      shouldSendMetadata,
      shouldSetOnWindow,
      shouldShimWeb3,
      autoRequestAccounts: false,
      debug,
    });

    const proxiedProvieer = new Proxy(provider, {
      // some common libraries, e.g. web3@1.x, mess with our API
      deleteProperty: () => true,
    });
    this.provider = proxiedProvieer;

    if (shouldSetOnWindow) {
      setGlobalProvider(this.provider);
    }

    if (shouldShimWeb3) {
      shimWeb3(this.provider);
    }

    this.provider.on('_initialized', () => {
      const info = {
        chainId: this.provider.chainId,
        isConnected: this.provider.isConnected(),
        isMetaNask: this.provider.isMetaMask,
        selectedAddress: this.provider.selectedAddress,
        networkVersion: this.provider.networkVersion,
      };
      console.info(`Ethereum provider initialized`, info);
    });
  }

  /**
   * Factory method to initialize an Ethereum service.
   *
   * @param props
   */
  static init(props: EthereumProps) {
    if (props.debug) {
      console.debug(`Ethereum::init()`);
    }
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
