import { Duplex } from 'stream';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { handleChainChanged } from '../services/SDKProvider/ChainManager/handleChainChanged';
import { handleDisconnect } from '../services/SDKProvider/ConnectionManager/handleDisconnect';
import { initializeState } from '../services/SDKProvider/InitializationManager/initializeState';
import { initializeStateAsync } from '../services/SDKProvider/InitializationManager/initializeStateAsync';

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
  public debug = false;

  public autoRequestAccounts = false;

  public providerStateRequested = false;

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

    if (debug) {
      console.debug(
        `SDKProvider::constructor debug=${debug} autoRequestAccounts=${autoRequestAccounts}`,
      );
    }
    this.autoRequestAccounts = autoRequestAccounts;
    this.debug = debug;
  }

  async forceInitializeState() {
    if (this.debug) {
      console.debug(
        `SDKProvider::forceInitializeState() autoRequestAccounts=${this.autoRequestAccounts}`,
      );
    }
    return this._initializeStateAsync();
  }

  _setConnected() {
    if (this.debug) {
      console.debug(`SDKProvider::_setConnected()`);
    }
    this._state.isConnected = true;
  }

  getState() {
    return this._state;
  }

  handleDisconnect({ terminate = false }: { terminate: boolean }) {
    handleDisconnect({
      terminate,
      instance: this,
    });
  }

  protected async _initializeStateAsync(): Promise<void> {
    return initializeStateAsync(this);
  }

  protected _initializeState(
    initialState?:
      | {
          accounts: string[];
          chainId: string;
          isUnlocked: boolean;
          networkVersion?: string | undefined;
        }
      | undefined,
  ): void {
    return initializeState(
      this,
      super._initializeState.bind(this),
      initialState,
    );
  }

  protected _handleChainChanged({
    chainId,
    networkVersion,
  }: { chainId?: string; networkVersion?: string } = {}) {
    handleChainChanged({
      instance: this,
      chainId,
      networkVersion,
      superHandleChainChanged: super._handleChainChanged.bind(this),
    });
  }
}
