import { setGlobalProvider, shimWeb3 } from '@metamask/providers';
import { Duplex } from 'readable-stream';
import { SDKProvider } from '../provider/SDKProvider';
import { logger } from '../utils/logger';
import { MetaMaskSDK } from '../sdk';
import { MetaMaskSDKEvent } from '../types/MetaMaskSDKEvents';

export interface EthereumProps {
  shouldSetOnWindow: boolean;
  connectionStream: Duplex;
  shouldSendMetadata?: boolean;
  shouldShimWeb3: boolean;
  sdkInstance: MetaMaskSDK;
}

export class Ethereum {
  private static instance?: Ethereum;

  private provider: SDKProvider;

  private sdkInstance: MetaMaskSDK;

  private constructor({
    shouldSetOnWindow,
    connectionStream,
    shouldSendMetadata = false,
    shouldShimWeb3,
    sdkInstance,
  }: EthereumProps) {
    const provider = new SDKProvider({
      connectionStream,
      shouldSendMetadata,
      shouldSetOnWindow,
      shouldShimWeb3,
      autoRequestAccounts: false,
    });

    const proxiedProvieer = new Proxy(provider, {
      // some common libraries, e.g. web3@1.x, can confict with our API.
      deleteProperty: () => true,
    });

    this.provider = proxiedProvieer;
    this.sdkInstance = sdkInstance;
    if (shouldSetOnWindow && typeof window !== 'undefined') {
      setGlobalProvider(provider);
    }

    if (shouldShimWeb3 && typeof window !== 'undefined') {
      shimWeb3(this.provider);
    }

    // Propagate display_uri events to the SDK
    this.provider.on('display_uri', (uri) => {
      this.sdkInstance.emit(MetaMaskSDKEvent.DisplayURI, uri as string);
    });

    this.provider.on('_initialized', () => {
      const info = {
        chainId: this.provider.getChainId(),
        isConnected: this.provider.isConnected(),
        isMetaMask: this.provider.isMetaMask,
        selectedAddress: this.provider.getSelectedAddress(),
        networkVersion: this.provider.getNetworkVersion(),
      };

      // Also emit initialized event on sdk.
      this.sdkInstance.emit(MetaMaskSDKEvent.Initialized, info);

      logger(`[Ethereum: constructor()] provider initialized`, info);
    });
  }

  /**
   * Factory method to initialize an Ethereum service.
   *
   * @param props
   */
  static init(props: EthereumProps) {
    logger(`[Ethereum: init()] Initializing Ethereum service`);

    this.instance = new Ethereum(props);
    return this.instance?.provider;
  }

  static destroy() {
    // Do not reinitialize to instance to avoid throwing on terminated.
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
