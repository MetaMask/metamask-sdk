import {
  CommunicationLayerPreference,
  DappMetadata,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';
import EventEmitter2 from 'eventemitter2';
import { createInstance, i18n } from 'i18next';
import packageJson from '../package.json';
import { MetaMaskInstaller } from './Platform/MetaMaskInstaller';
import { PlatformManager } from './Platform/PlatfformManager';
import { SDKProvider } from './provider/SDKProvider';
import { Analytics } from './services/Analytics';
import {
  connect,
  resume,
  terminate,
} from './services/MetaMaskSDK/ConnectionManager';
import { connectAndSign } from './services/MetaMaskSDK/ConnectionManager/connectAndSign';
import { initializeMetaMaskSDK } from './services/MetaMaskSDK/InitializerManager';
import { RPC_URLS_MAP } from './services/MetaMaskSDK/InitializerManager/setupReadOnlyRPCProviders';
import {
  RemoteConnection,
  RemoteConnectionProps,
} from './services/RemoteConnection';
import { SDKLoggingOptions } from './types/SDKLoggingOptions';
import { SDKUIOptions } from './types/SDKUIOptions';
import { WakeLockStatus } from './types/WakeLockStatus';

export interface MetaMaskSDKOptions {
  /**
   * The Infura API key to use for RPC requests.
   */
  infuraAPIKey?: string;

  /**
   * Allow sending read-only rpc calls before the user has connected to the wallet.
   * The value will be automatically updated to the wallet chainId once connected.
   */
  defaultReadOnlyChainId?: number | `0x${string}`;

  /**
   * A map of RPC URLs to use for read-only requests.
   */
  readonlyRPCMap?: RPC_URLS_MAP;

  /**
   * If true, the SDK will inject the provider into the global `window` object.
   */
  injectProvider?: boolean;

  /**
   * If true, the SDK will force inject the provider into the global `window` object.
   */
  forceInjectProvider?: boolean;

  /**
   * If true, the SDK will force delete the provider from the global `window` object.
   */
  forceDeleteProvider?: boolean;

  /**
   * If true, the SDK will check if MetaMask is installed on the user's browser and send a connection request. If not it will prompt the user to install it. If false, the SDK will wait for the connect method to be called to check if MetaMask is installed.
   */
  checkInstallationImmediately?: boolean;

  /**
   * If true, the SDK will check if MetaMask is installed on the user's browser before each RPC call. If not it will prompt the user to install it.
   */
  checkInstallationOnAllCalls?: boolean;

  /**
   * If true, the SDK will prefer the desktop version of MetaMask over the mobile version.
   */
  preferDesktop?: boolean;

  /**
   * A function that will be called to open a deeplink to the MetaMask Mobile app.
   */
  openDeeplink?: (arg: string) => void;

  /**
   * If true, the SDK will use deeplinks to connect with MetaMask Mobile. If false, the SDK will use universal links to connect with MetaMask Mobile.
   */
  useDeeplink?: boolean;

  /**
   * The type of wake lock to use when the SDK is running in the background.
   */
  wakeLockType?: WakeLockStatus;

  /**
   * If true, the SDK will shim the window.web3 object with the provider returned by the SDK (useful for compatibility with older browser).
   */
  shouldShimWeb3?: boolean;

  /**
   * The preferred communication layer to use for the SDK.
   */
  communicationLayerPreference?: CommunicationLayerPreference;

  /**
   * An array of transport protocols to use for communication with the MetaMask wallet.
   */
  transports?: string[];

  /**
   * Metadata about the dapp using the SDK.
   */
  dappMetadata: DappMetadata;

  /**
   * A timer object to use for scheduling tasks.
   */
  timer?: any;

  /**
   * Send anonymous analytics to MetaMask to help us improve the SDK.
   */
  enableDebug?: boolean;

  /**
   * If MetaMask browser extension is detected, directly use it.
   */
  extensionOnly?: boolean;

  /**
   * Options for customizing the SDK UI.
   */
  ui?: SDKUIOptions;

  /**
   * An object that allows you to customize or translate each of the displayed modals. See the nodejs example for more information.
   */
  modals?: RemoteConnectionProps['modals'];

  /**
   * The URL of the communication server to use for the SDK.
   */
  communicationServerUrl?: string;

  /**
   * Options for customizing the storage manager used by the SDK.
   */
  storage?: StorageManagerProps;

  /**
   * Options for customizing the logging behavior of the SDK.
   */
  logging?: SDKLoggingOptions;

  /**
   * A string to track external integrations (e.g. wagmi).
   */
  _source?: string;

  /*
   * Options for enabling i18n multi-language support on the SDK.
   */
  i18nOptions?: {
    debug?: boolean;
    enabled?: boolean;
  };
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

  public i18nInstance: i18n = createInstance();

  public availableLanguages: string[] = ['en'];

  constructor(
    options: MetaMaskSDKOptions = {
      storage: {
        enabled: true,
      },
      injectProvider: true,
      forceInjectProvider: false,
      enableDebug: true,
      shouldShimWeb3: true,
      useDeeplink: true,
      dappMetadata: {
        name: '',
        url: '',
      },
      i18nOptions: {
        enabled: false,
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

  // WARNING: This method only works for MetaMask Mobile v7.10+. It will throw an error otherwise.
  // msg can be a simple string or ABNF RFC 5234 compliant string.
  async connectAndSign({ msg }: { msg: string }) {
    return connectAndSign({ instance: this, msg });
  }

  resume() {
    return resume(this);
  }

  /**
   * DEPRECATED: use terminate() instead.
   */
  disconnect() {
    console.warn(`MetaMaskSDK.disconnect() is deprecated, use terminate()`);
    this.terminate();
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

  getRPCHistory() {
    return this.remoteConnection?.getConnector()?.getRPCMethodTracker();
  }

  getVersion() {
    return packageJson.version;
  }
}
