import {
  CommunicationLayerPreference,
  DappMetadata,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';
import EventEmitter2 from 'eventemitter2';
import { MetaMaskInstaller } from './Platform/MetaMaskInstaller';
import { PlatformManager } from './Platform/PlatfformManager';
import { SDKProvider } from './provider/SDKProvider';
import { Analytics } from './services/Analytics';
import {
  connect,
  resume,
  terminate,
} from './services/MetaMaskSDK/ConnectionManager';
import { initializeMetaMaskSDK } from './services/MetaMaskSDK/InitializerManager';
import {
  RemoteConnection,
  RemoteConnectionProps,
} from './services/RemoteConnection';
import { SDKLoggingOptions } from './types/SDKLoggingOptions';
import { SDKUIOptions } from './types/SDKUIOptions';
import { WakeLockStatus } from './types/WakeLockStatus';
import { RPC_URLS_MAP } from './services/MetaMaskSDK/InitializerManager/setupRPCNetworkMap';

export interface MetaMaskSDKOptions {
  infuraAPIKey?: string;
  /**
   * Allow sending read-only rpc calls before the user has connected to the wallet.
   * The value will be automatically updated to the wallet chainId once connected.
   */
  defaultReadOnlyChainId?: number | `0x${string}`;
  readonlyRPCMap?: RPC_URLS_MAP;
  injectProvider?: boolean;
  forceInjectProvider?: boolean;
  forceDeleteProvider?: boolean;
  // Tries to autoconnect on startup (only for Desktop WEB)
  checkInstallationImmediately?: boolean;
  checkInstallationOnAllCalls?: boolean;
  preferDesktop?: boolean;
  openDeeplink?: (arg: string) => void;
  useDeeplink?: boolean;
  wakeLockType?: WakeLockStatus;
  shouldShimWeb3?: boolean;
  communicationLayerPreference?: CommunicationLayerPreference;
  transports?: string[];
  dappMetadata: DappMetadata;
  timer?: any;
  enableDebug?: boolean;
  /**
   * If MetaMask browser extension is detected, directly use it.
   */
  extensionOnly?: boolean;
  ui?: SDKUIOptions;
  modals?: RemoteConnectionProps['modals'];
  communicationServerUrl?: string;
  storage?: StorageManagerProps;
  logging?: SDKLoggingOptions;
  // _source to track external integrations (eg: wagmi)
  _source?: string;
}

export class MetaMaskSDK extends EventEmitter2 {
  public options: MetaMaskSDKOptions;

  public activeProvider?: SDKProvider;

  public sdkProvider?: SDKProvider;

  public remoteConnection?: RemoteConnection;

  public installer?: MetaMaskInstaller;

  public platformManager?: PlatformManager;

  public dappMetadata?: DappMetadata;

  public extensionActive = false;

  public _initialized = false;

  public sdkInitPromise?: Promise<void>;

  public debug = false;

  public analytics?: Analytics;

  private readonlyRPCCalls = false;

  public defaultReadOnlyChainId = `0x1`;

  constructor(
    options: MetaMaskSDKOptions = {
      storage: {
        enabled: true,
      },
      injectProvider: true,
      forceInjectProvider: false,
      enableDebug: true,
      shouldShimWeb3: true,
      dappMetadata: {
        name: '',
        url: '',
      },
    },
  ) {
    super();

    this.setMaxListeners(50);

    if (!options.dappMetadata?.name && !options.dappMetadata?.url) {
      // Automatically set dappMetadata on web env.
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        options.dappMetadata = {
          url: window.location.href,
          name: document.title,
        };
      } else {
        throw new Error(
          `You must provide dAppMetadata option (name and/or url)`,
        );
      }
    }

    if (options.defaultReadOnlyChainId) {
      if (typeof options.defaultReadOnlyChainId === 'number') {
        this.defaultReadOnlyChainId = `0x${options.defaultReadOnlyChainId.toString(
          16,
        )}`; // convert to hex string
      } else if (
        typeof options.defaultReadOnlyChainId === 'string' &&
        !options.defaultReadOnlyChainId.startsWith('0x')
      ) {
        throw new Error(`Invalid defaultReadOnlyChainId, must start with '0x'`);
      }
      this.defaultReadOnlyChainId = options.defaultReadOnlyChainId.toString();
    }

    this.options = options;

    // Automatically initialize the SDK to keep the same behavior as before
    this.init()
      .then(() => {
        if (this.debug) {
          console.debug(`MetaMaskSDK() initialized`);
        }
      })
      .catch((err) => {
        console.error(`MetaMaskSDK error during initialization`, err);
      });
  }

  // TODO make method private to let dapp call connect() directly.
  public async init() {
    return initializeMetaMaskSDK(this);
  }

  isExtensionActive() {
    return this.extensionActive;
  }

  async connect() {
    return connect(this);
  }

  resume() {
    return resume(this);
  }

  disconnect() {
    this.remoteConnection?.disconnect();
  }

  isAuthorized() {
    this.remoteConnection?.isAuthorized();
  }

  terminate() {
    return terminate(this);
  }

  isInitialized() {
    return this._initialized;
  }

  setReadOnlyRPCCalls(allowed: boolean) {
    this.readonlyRPCCalls = allowed;
  }

  hasReadOnlyRPCCalls() {
    return this.readonlyRPCCalls;
  }

  // Return the active ethereum provider object
  getProvider(): SDKProvider {
    if (!this.activeProvider) {
      throw new Error(`SDK state invalid -- undefined provider`);
    }

    return this.activeProvider;
  }

  getUniversalLink() {
    const universalLink = this.remoteConnection?.getUniversalLink();

    if (!universalLink) {
      throw new Error(
        'No Universal Link available, please call eth_requestAccounts first.',
      );
    }

    return universalLink;
  }

  // TODO: remove once reaching sdk 1.0
  // Not exposed. Should only be used during dev.
  _getChannelConfig() {
    return this.remoteConnection?.getChannelConfig();
  }

  _ping() {
    this.remoteConnection?.getConnector()?.ping();
  }

  _keyCheck() {
    this.remoteConnection?.getConnector()?.keyCheck();
  }

  _getServiceStatus() {
    return this.remoteConnection?.getConnector()?.getServiceStatus();
  }

  _getRemoteConnection() {
    return this.remoteConnection;
  }

  _getDappMetadata(): DappMetadata | undefined {
    return this.dappMetadata;
  }

  _getKeyInfo() {
    return this.remoteConnection?.getKeyInfo();
  }

  _resetKeys() {
    this.remoteConnection?.getConnector()?.resetKeys();
  }

  _getConnection() {
    return this.remoteConnection;
  }
}
