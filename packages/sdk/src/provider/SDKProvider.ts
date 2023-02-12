import { Duplex } from 'stream';
import { MetaMaskInpageProvider } from '@metamask/providers';

export interface SDKProviderProps {
  /**
   * The stream used to connect to the wallet.
   */
  connectionStream: Duplex;

  /**
   * Automatically call eth_requestAccounts on initialization.
   */
  autoRequestAccounts?: boolean;

  /**
   * Whether the provider should be set as window.ethereum.
   */
  shouldSetOnWindow?: boolean;
  shouldSendMetadata?: boolean;
  /**
   * Whether the window.web3 shim should be set.
   */
  shouldShimWeb3?: boolean;
  debug?: boolean;
}

export class SDKProvider extends MetaMaskInpageProvider {
  private debug = false;
  private autoRequestAccounts = false;

  constructor({
    connectionStream,
    shouldSendMetadata,
    debug = false,
    autoRequestAccounts = false,
  }: SDKProviderProps) {
    super(connectionStream, {
      logger: console,
      maxEventListeners: 100,
      shouldSendMetadata,
    });
    this.autoRequestAccounts = autoRequestAccounts;
    this.debug = debug;
  }

  async forceInitializeState() {
    if (this.debug) {
      console.debug(
        `SDKProvider::forceInitializeState() autoRequestAccounts=${this.autoRequestAccounts}`,
      );
    }
    this._initializeStateAsync();
    if (this.autoRequestAccounts) {
      await this.request({
        method: 'eth_requestAccounts',
        params: [],
      });
    }
  }

  getState() {
    return this._state;
  }

  handleDisconnect() {
    if (this.debug) {
      console.debug(
        `SDKProvider::handleDisconnect() cleaning up provider state`,
      );
    }
    this._handleAccountsChanged([]);
    this._handleDisconnect(true);
    // provider._state.isConnected = false;
    // provider.emit('disconnect', ErrorMessages.MANUAL_DISCONNECT);
  }

  protected _handleChainChanged({
    chainId,
    networkVersion,
  }: { chainId?: string; networkVersion?: string } = {}) {
    console.debug(
      `SDKProvider::_handleChainChanged chainId=${chainId} networkVersion=${networkVersion}`,
    );
    // FIXME on RN IOS networkVersion is sometime missing? why?
    let forcedNetworkVersion = networkVersion;
    if (!networkVersion) {
      console.info(`WARNING: forced network version to prevent provider error`);
      forcedNetworkVersion = '1';
    }

    super._handleChainChanged({
      chainId,
      networkVersion: forcedNetworkVersion,
    });
  }
}
