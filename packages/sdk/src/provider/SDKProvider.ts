import { Duplex } from 'readable-stream';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { logger } from '../utils/logger';
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
}

interface SDKProviderState {
  autoRequestAccounts: boolean;
  providerStateRequested: boolean;
  chainId: string;
  networkVersion?: string;
}

export class SDKProvider extends MetaMaskInpageProvider {
  public state: SDKProviderState = {
    autoRequestAccounts: false,
    providerStateRequested: false,
    chainId: '',
    networkVersion: '',
  };

  constructor({
    connectionStream,
    shouldSendMetadata,
    autoRequestAccounts = false,
  }: SDKProviderProps) {
    super(connectionStream, {
      logger: console,
      maxEventListeners: 100,
      shouldSendMetadata,
    });

    logger(
      `[SDKProvider: constructor()] autoRequestAccounts=${autoRequestAccounts}`,
    );
    this.state.autoRequestAccounts = autoRequestAccounts;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.request({ method: 'eth_chainId' }).then((chainId) => {
      console.log('chainId =>', chainId);
      this.state.chainId = chainId as string;
    });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.request({ method: 'net_version' }).then((networkVersion) => {
      console.log('networkVersion =>', networkVersion);
      this.state.networkVersion = networkVersion as string;
    });
  }

  async forceInitializeState() {
    logger(
      `[SDKProvider: forceInitializeState()] autoRequestAccounts=${this.state.autoRequestAccounts}`,
    );

    return this._initializeStateAsync();
  }

  _setConnected() {
    logger(`[SDKProvider: _setConnected()] Setting connected state`);

    this._state.isConnected = true;
  }

  getState() {
    return this._state;
  }

  getSDKProviderState() {
    return this.state;
  }

  getSelectedAddress() {
    const { accounts } = this._state;

    if (!accounts || accounts.length === 0) {
      console.log('No accounts found');
      return null;
    }

    return accounts[0] || '';
  }

  getChainId() {
    return this.state.chainId;
  }

  getNetworkVersion() {
    return this.state.networkVersion;
  }

  setSDKProviderState(state: Partial<SDKProviderState>) {
    this.state = {
      ...this.state,
      ...state,
    };
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
    this.state.chainId = chainId as string;
    this.state.networkVersion = networkVersion as string;

    handleChainChanged({
      instance: this,
      chainId,
      networkVersion,
      superHandleChainChanged: super._handleChainChanged.bind(this),
    });
  }
}
