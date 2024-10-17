import { MetaMaskInpageProvider } from '@metamask/providers';
import {
  CommunicationLayerPreference,
  DappMetadata,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';
import debug from 'debug';

import EventEmitter2 from 'eventemitter2';
import { createInstance, i18n } from 'i18next';
import packageJson from '../package.json';
import { MetaMaskInstaller } from './Platform/MetaMaskInstaller';
import { PlatformManager } from './Platform/PlatfformManager';
import { DEFAULT_SDK_SOURCE } from './constants';
import { SDKProvider } from './provider/SDKProvider';
import { Analytics } from './services/Analytics';
import {
  connect,
  resume,
  terminate,
} from './services/MetaMaskSDK/ConnectionManager';
import { connectAndSign } from './services/MetaMaskSDK/ConnectionManager/connectAndSign';
import { connectWith } from './services/MetaMaskSDK/ConnectionManager/connectWith';
import { initializeMetaMaskSDK } from './services/MetaMaskSDK/InitializerManager';
import { RPC_URLS_MAP } from './services/MetaMaskSDK/InitializerManager/setupReadOnlyRPCProviders';
import {
  RemoteConnection,
  RemoteConnectionProps,
} from './services/RemoteConnection';
import {
  MetaMaskSDKEventPayload,
  MetaMaskSDKEventType,
} from './types/MetaMaskSDKEvents';
import { SDKLoggingOptions } from './types/SDKLoggingOptions';
import { SDKUIOptions } from './types/SDKUIOptions';
import { logger } from './utils/logger';

export interface MetaMaskSDKOptions {
  /**
   * The Infura API key to use for RPC requests.
   */
  infuraAPIKey?: string;

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
   * If true, the SDK will not display any modals or QR code UI.
   */
  headless?: boolean;

  /**
   * A function that will be called to open a deeplink to the MetaMask Mobile app.
   */
  openDeeplink?: (arg: string) => void;

  /**
   * If true, the SDK will use deeplinks to connect with MetaMask Mobile. If false, the SDK will use universal links to connect with MetaMask Mobile.
   */
  useDeeplink?: boolean;

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
  enableAnalytics?: boolean;

  /**
   * If MetaMask browser extension is detected, directly use it.
   */
  extensionOnly?: boolean;

  /**
   * @deprecated Use the 'display_uri' event on the provider instead.
   * Listen to this event to get the QR code URL and customize your UI.
   * Example:
   * sdk.getProvider().on('display_uri', (uri: string) => {
   *   // Use the uri to display a QR code or customize your UI
   * });
   */
  ui?: SDKUIOptions;

  /**
   * @deprecated Use the 'display_uri' event on the provider instead.
   * Listen to this event to get the QR code URL and customize your UI.
   * Example:
   * sdk.getProvider().on('display_uri', (uri: string) => {
   *   // Use the uri to display a QR code or customize your UI
   * });
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

  public extension: MetaMaskInpageProvider | undefined;

  public _initialized = false;

  public sdkInitPromise?: Promise<void> | undefined = undefined;

  public debug = false;

  public analytics?: Analytics;

  private readonlyRPCCalls = false;

  public i18nInstance: i18n = createInstance();

  public availableLanguages: string[] = ['en'];

  constructor(
    options: MetaMaskSDKOptions = {
      storage: {
        enabled: true,
      },
      injectProvider: true,
      forceInjectProvider: false,
      enableAnalytics: true,
      shouldShimWeb3: true,
      useDeeplink: true,
      extensionOnly: true,
      headless: false,
      dappMetadata: {
        name: '',
        url: '',
        iconUrl: '',
      },
      _source: DEFAULT_SDK_SOURCE,
      i18nOptions: {
        enabled: false,
      },
    },
  ) {
    super();
    debug.disable(); // initially disabled

    const developerMode = options.logging?.developerMode === true;
    const debugEnabled = options.logging?.sdk || developerMode;

    if (debugEnabled) {
      debug.enable('MM_SDK');
    }
    logger(`[MetaMaskSDK: constructor()]: begin.`);
    this.setMaxListeners(50);

    if (!options.dappMetadata?.url) {
      // Automatically set dappMetadata on web env.
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        options.dappMetadata = {
          ...options.dappMetadata,
          url: `${window.location.protocol}//${window.location.host}`,
        };
      } else {
        throw new Error(`You must provide dAppMetadata url`);
      }
    }

    this.options = options;
    if (!this.options._source) {
      options._source = DEFAULT_SDK_SOURCE;
    }

    // Automatically initialize the SDK to keep the same behavior as before
    this.init()
      .then(() => {
        logger(`[MetaMaskSDK: constructor()]: initialized successfully.`);
        if (typeof window !== 'undefined') {
          window.mmsdk = this;
        }
      })
      .catch((err) => {
        console.error(
          `[MetaMaskSDK: constructor()] error during initialization`,
          err,
        );
      });
  }

  /**
   * @deprecated init is called automatically when the SDK is instantiated.
   * You can subscribe to the 'initialized' event to know when the SDK is ready or call connect() to start the connection process.
   * @returns {Promise<void>} - A promise that resolves when the SDK is initialized.
   */
  public async init() {
    return initializeMetaMaskSDK(this);
  }

  /**
   * Check if the active connection is done via the MetaMask browser extension/
   * @returns {boolean} - True if the MetaMask browser extension is the active provider, false otherwise.
   */
  isExtensionActive() {
    return this.extensionActive;
  }

  /**
   * Check if the MetaMask extension is potentially available in the current browser environment.
   * This method is not the preferred way to detect MetaMask. Use EIP-6963 instead,
   * as many extensions can fake the isMetaMask property. EIP-6963 provides more accurate provider detection.
   * @returns {boolean} - True if MetaMask is potentially available, false otherwise.
   */
  checkExtensionAvailability(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return Boolean(window.ethereum?.isMetaMask);
  }

  /**
   * Connect to MetaMask.
   * @returns {Promise<string[]>} - A promise that resolves to an array of account addresses.
   */
  async connect(): Promise<string[]> {
    return connect(this);
  }

  // WARNING: This method only works for MetaMask Mobile v7.10+. It will throw an error otherwise.
  // msg can be a simple string or ABNF RFC 5234 compliant string.
  async connectAndSign({ msg }: { msg: string }) {
    return connectAndSign({ instance: this, msg });
  }

  async connectWith(rpc: { method: string; params: any[] }) {
    return connectWith({ instance: this, rpc });
  }

  resume() {
    return resume(this);
  }

  /**
   * DEPRECATED: use terminate() instead.
   */
  disconnect() {
    console.warn(`MetaMaskSDK.disconnect() is deprecated, use terminate()`);
    return this.terminate();
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
  getProvider(): SDKProvider | undefined {
    if (!this.activeProvider) {
      console.warn(`MetaMaskSDK: No active provider found`);
      return undefined;
    }

    return this.activeProvider;
  }

  getMobileProvider(): SDKProvider {
    if (!this.sdkProvider) {
      throw new Error(`SDK state invalid -- undefined mobile provider`);
    }

    return this.sdkProvider;
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

  getChannelId() {
    return this.remoteConnection?.getChannelConfig()?.channelId;
  }

  getRPCHistory() {
    return this.remoteConnection?.getConnector()?.getRPCMethodTracker();
  }

  getVersion() {
    return packageJson.version;
  }

  getWalletStatus() {
    return this.remoteConnection?.getConnector()?.getConnectionStatus();
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

  public emit<K extends MetaMaskSDKEventType>(
    event: K,
    payload: MetaMaskSDKEventPayload<K>,
  ): boolean {
    return super.emit(event, payload);
  }

  public on<K extends MetaMaskSDKEventType>(
    event: K,
    listener: (payload: MetaMaskSDKEventPayload<K>) => void,
  ): this {
    return super.on(event, listener) as this;
  }
}
