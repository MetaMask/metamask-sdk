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
    this.provider = initializeProvider({
      shouldSetOnWindow,
      connectionStream,
      shouldSendMetadata,
      shouldShimWeb3,
    });

    this.provider.on('_initialized', (args) => {
      console.info(`INITIALIZEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEd`, args);
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
