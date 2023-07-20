import {
  CommunicationLayerPreference,
  ConnectionStatus,
  DappMetadata,
  DEFAULT_SERVER_URL,
  EventType,
  ServiceStatus,
  StorageManagerProps,
  TrackingEvents,
} from '@metamask/sdk-communication-layer';
import EventEmitter2 from 'eventemitter2';
import { STORAGE_PROVIDER_TYPE } from './config';
import { MetaMaskInstaller } from './Platform/MetaMaskInstaller';
import { PlatformManager } from './Platform/PlatfformManager';
import initializeProvider from './provider/initializeProvider';
import { SDKProvider } from './provider/SDKProvider';
import { Analytics } from './services/Analytics';
import { Ethereum } from './services/Ethereum';
import {
  RemoteConnection,
  RemoteConnectionProps,
} from './services/RemoteConnection';
import { getStorageManager } from './storage-manager/getStorageManager';
import { PROVIDER_UPDATE_TYPE } from './types/ProviderUpdateType';
import { SDKLoggingOptions } from './types/SDKLoggingOptions';
import { SDKUIOptions } from './types/SDKUIOptions';
import { WakeLockStatus } from './types/WakeLockStatus';
import { extractFavicon } from './utils/extractFavicon';
import { getBrowserExtension } from './utils/get-browser-extension';
import { getBase64FromUrl } from './utils/getBase64FromUrl';

export interface MetaMaskSDKOptions {
  injectProvider?: boolean;
  forceInjectProvider?: boolean;
  forceDeleteProvider?: boolean;
  // Tries to autoconnect on startup
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
  developerMode?: boolean;
  ui?: SDKUIOptions;
  modals?: RemoteConnectionProps['modals'];
  communicationServerUrl?: string;
  storage?: StorageManagerProps;
  logging?: SDKLoggingOptions;
  // _source to track external integrations (eg: wagmi)
  _source?: string;
}

export class MetaMaskSDK extends EventEmitter2 {
  private options: MetaMaskSDKOptions;

  public activeProvider?: SDKProvider;

  private sdkProvider?: SDKProvider;

  private remoteConnection?: RemoteConnection;

  private installer?: MetaMaskInstaller;

  private platformManager?: PlatformManager;

  private dappMetadata?: DappMetadata;

  private extensionActive = false;

  private _initialized = false;

  private sdkInitPromise?: Promise<void>;

  private debug = false;

  private analytics?: Analytics;

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

    this.options = options;

    // Automatically initialize the SDK to keep the same behavior as before
    this.init().catch((err) => {
      console.error(`MetaMaskSDK error during initialization`, err);
    });
  }

  // TODO make method private to let dapp call connect() directly.
  public async init() {
    if (this._initialized) {
      if (this.debug) {
        console.info(`SDK::init() already initialized`);
      }
      return this.sdkInitPromise;
    } else if (this.sdkInitPromise) {
      if (this.debug) {
        console.info(`SDK::init() already initializing`);
      }
      return this.sdkInitPromise;
    }

    // Prevent multiple instances of the SDK to be initialized at the same time
    try {
      this.sdkInitPromise = this._doInit();
      await this.sdkInitPromise;
    } catch (err) {
      console.error(err);
      throw err;
    }

    return this.sdkInitPromise;
  }

  private async _doInit() {
    const {
      dappMetadata,
      // Provider
      injectProvider = true,
      // Shim web3 on Provider
      shouldShimWeb3 = true,
      // Installation
      checkInstallationImmediately,
      checkInstallationOnAllCalls,
      // Platform settings
      preferDesktop,
      openDeeplink,
      useDeeplink = false,
      wakeLockType,
      communicationLayerPreference = CommunicationLayerPreference.SOCKET,
      extensionOnly,
      transports,
      _source,
      timer,
      // Debugging
      enableDebug = true,
      communicationServerUrl,
      modals,
      // persistence settings
      storage = {
        enabled: true,
      },
      logging = {},
    } = this.options;

    const developerMode = logging?.developerMode === true;
    this.debug = logging?.sdk || developerMode;
    if (this.debug) {
      console.debug(`SDK::_doInit() now`, this.options);
    }

    // Make sure to enable all logs if developer mode is on
    const runtimeLogging = { ...logging };

    if (developerMode) {
      runtimeLogging.sdk = true;
      runtimeLogging.eciesLayer = true;
      runtimeLogging.keyExchangeLayer = true;
      runtimeLogging.remoteLayer = true;
      runtimeLogging.serviceLayer = true;
    }

    this.platformManager = new PlatformManager({
      useDeepLink: useDeeplink,
      preferredOpenLink: openDeeplink,
      wakeLockStatus: wakeLockType,
      debug: this.debug,
    });

    const platformType = this.platformManager.getPlatformType();

    this.analytics = new Analytics({
      serverURL: communicationServerUrl ?? DEFAULT_SERVER_URL,
      debug: this.debug,
      metadata: {
        url: dappMetadata.url ?? '',
        title: dappMetadata.name ?? '',
        platform: platformType,
        source: _source ?? '',
      },
    });

    if (storage?.enabled === true && !storage.storageManager) {
      storage.storageManager = getStorageManager(
        // this.platformManager,
        storage,
      );
    }

    if (this.platformManager.isBrowser() && !dappMetadata.base64Icon) {
      // Try to extract default icon
      const favicon = extractFavicon();
      if (favicon) {
        try {
          const faviconUri = await getBase64FromUrl(favicon);
          dappMetadata.base64Icon = faviconUri;
        } catch (err) {
          // Ignore favicon error.
        }
      }
    }

    this.dappMetadata = dappMetadata;

    let metamaskBrowserExtension;
    let preferExtension = false;

    if (
      typeof window !== 'undefined' &&
      window.ethereum &&
      !this.platformManager.isMetaMaskMobileWebView()
    ) {
      preferExtension =
        localStorage.getItem(STORAGE_PROVIDER_TYPE) === 'extension';

      try {
        metamaskBrowserExtension = getBrowserExtension({
          mustBeMetaMask: true,
        });
        window.extension = metamaskBrowserExtension;
      } catch (err) {
        // Ignore error if metamask extension not found
        delete window.extension;
      }
      Ethereum.destroy();
    } else if (this.platformManager.isMetaMaskMobileWebView()) {
      this.analytics.send({ event: TrackingEvents.SDK_USE_INAPP_BROWSER });
      this.activeProvider = window.ethereum;
      this._initialized = true;
      return;
    }

    if (metamaskBrowserExtension && extensionOnly) {
      if (developerMode) {
        console.warn(`EXTENSION ONLY --- prevent sdk initialization`);
      }
      this.analytics.send({ event: TrackingEvents.SDK_USE_EXTENSION });
      this.activeProvider = metamaskBrowserExtension;
      this.extensionActive = true;
      this._initialized = true;
      return;
    }

    this.remoteConnection = new RemoteConnection({
      communicationLayerPreference,
      dappMetadata,
      _source,
      enableDebug,
      timer,
      sdk: this,
      platformManager: this.platformManager,
      transports,
      communicationServerUrl,
      storage,
      getMetaMaskInstaller: () => {
        // used to prevent circular dependencies
        if (!this.installer) {
          throw new Error(`Invalid SDK status -- installer not initialized`);
        }
        return this.installer;
      },
      logging: runtimeLogging,
      connectWithExtensionProvider:
        metamaskBrowserExtension === undefined
          ? undefined
          : this.connectWithExtensionProvider.bind(this),
      modals: {
        ...modals,
        onPendingModalDisconnect: this.terminate.bind(this),
      },
    });

    this.installer = new MetaMaskInstaller({
      preferDesktop: preferDesktop ?? false,
      remote: this.remoteConnection,
      platformManager: this.platformManager,
      debug: this.debug,
    });

    // Inject our provider into window.ethereum
    this.activeProvider = initializeProvider({
      communicationLayerPreference,
      platformManager: this.platformManager,
      sdk: this,
      checkInstallationOnAllCalls,
      injectProvider,
      shouldShimWeb3,
      installer: this.installer,
      remoteConnection: this.remoteConnection,
      debug: this.debug,
    });

    this.initEventListeners();

    if (preferExtension) {
      if (this.debug) {
        console.debug(
          `SDK::_doInit() preferExtension is detected -- connect with it.`,
        );
      }

      this.connectWithExtensionProvider().catch((_err) => {
        console.warn(`Can't connect with MetaMask extension...`);
      });
    } else if (checkInstallationImmediately) {
      // This will check if the connection was correctly done or if the user needs to install MetaMask
      try {
        if (this.debug) {
          console.debug(`SDK::_doInit() checkInstallationImmediately`);
        }

        this.connect().catch((_err) => {
          // ignore error on autoconnect
          if (this.debug) {
            console.warn(`error during autoconnect`, _err);
          }
        });
      } catch (err: unknown) {
        // ignore error on autorocnnect
      }
    }

    this._initialized = true;
  }

  async connect() {
    if (!this._initialized) {
      if (this.debug) {
        console.log(`SDK::connect() provider not ready -- wait for init()`);
      }
      await this.init();
    }

    if (this.debug) {
      console.debug(`SDK::connect()`, this.activeProvider);
    }

    if (!this.activeProvider) {
      throw new Error(`SDK state invalid -- undefined provider`);
    }

    return this.activeProvider.request({
      method: 'eth_requestAccounts',
      params: [],
    });
  }

  /**
   * Setup event listeners on the remote connection and propagate appriopriate events
   */
  private initEventListeners() {
    this.remoteConnection
      ?.getConnector()
      ?.on(
        EventType.CONNECTION_STATUS,
        (connectionStatus: ConnectionStatus) => {
          this.emit(EventType.CONNECTION_STATUS, connectionStatus);
        },
      );

    this.remoteConnection
      ?.getConnector()
      ?.on(EventType.SERVICE_STATUS, (serviceStatus: ServiceStatus) => {
        this.emit(EventType.SERVICE_STATUS, serviceStatus);
      });
  }

  private async connectWithExtensionProvider() {
    if (this.debug) {
      console.debug(`SDK::connectWithExtensionProvider()`);
    }
    // save a copy of the instance before it gets overwritten
    this.sdkProvider = this.activeProvider;
    this.activeProvider = window.extension as any;
    // Set extension provider as default on window
    window.ethereum = window.extension as any;
    // always create initial query to connect the account
    await this.activeProvider?.request({
      method: 'eth_requestAccounts',
    });

    // remember setting for next time (until terminated)
    localStorage.setItem(STORAGE_PROVIDER_TYPE, 'extension');
    this.extensionActive = true;
    this.emit(EventType.PROVIDER_UPDATE, PROVIDER_UPDATE_TYPE.EXTENSION);
    this.analytics?.send({ event: TrackingEvents.SDK_USE_EXTENSION });
  }

  resume() {
    if (!this.remoteConnection?.getConnector()?.isReady()) {
      if (this.debug) {
        console.debug(`SDK::resume channel`);
      }
      this.remoteConnection?.startConnection();
    }
  }

  disconnect() {
    this.remoteConnection?.disconnect();
  }

  isAuthorized() {
    this.remoteConnection?.isAuthorized();
  }

  terminate() {
    // nothing to do on inapp browser.
    if (this.platformManager?.isMetaMaskMobileWebView()) {
      return;
    }

    // check if connected with extension provider
    // if it is, disconnect from it and switch back to injected provider
    if (this.extensionActive) {
      localStorage.removeItem(STORAGE_PROVIDER_TYPE);
      if (this.options.extensionOnly) {
        if (this.debug) {
          console.warn(
            `SDK::terminate() extensionOnly --- prevent switching providers`,
          );
        }

        return;
      }
      // Re-use default extension provider as default
      this.activeProvider = this.sdkProvider;
      window.ethereum = this.activeProvider;
      this.extensionActive = false;
      this.emit(EventType.PROVIDER_UPDATE, PROVIDER_UPDATE_TYPE.TERMINATE);
      return;
    }

    this.emit(EventType.PROVIDER_UPDATE, PROVIDER_UPDATE_TYPE.TERMINATE);
    if (this.debug) {
      console.debug(`SDK::terminate()`, this.remoteConnection);
    }

    // Only disconnect if the connection is active
    this.remoteConnection?.disconnect({
      terminate: true,
      sendMessage: true,
    });
  }

  isInitialized() {
    return this._initialized;
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
