import {
  AutoConnectOptions,
  CommunicationLayerPreference,
  ConnectionStatus,
  DappMetadata,
  EventType,
  ServiceStatus,
  StorageManagerProps,
  SendAnalytics,
  TrackingEvents,
  DEFAULT_SERVER_URL,
} from '@metamask/sdk-communication-layer';
import EventEmitter2 from 'eventemitter2';
import WebView from 'react-native-webview';
import { Analytics } from './constants';
import { MetaMaskInstaller } from './Platform/MetaMaskInstaller';
import { Platform } from './Platform/Platfform';
import initializeProvider from './provider/initializeProvider';
import { SDKProvider } from './provider/SDKProvider';
import { Ethereum } from './services/Ethereum';
import {
  RemoteConnection,
  RemoteConnectionProps,
} from './services/RemoteConnection';
import { WalletConnect } from './services/WalletConnect';
import { getStorageManager } from './storage-manager/getStorageManager';
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
  checkInstallationImmediately?: boolean;
  forceRestartWalletConnect?: boolean;
  checkInstallationOnAllCalls?: boolean;
  preferDesktop?: boolean;
  openDeeplink?: (arg: string) => void;
  useDeeplink?: boolean;
  wakeLockType?: WakeLockStatus;
  WalletConnectInstance?: any;
  shouldShimWeb3?: boolean;
  webRTCLib?: any;
  communicationLayerPreference?: CommunicationLayerPreference;
  transports?: string[];
  dappMetadata: DappMetadata;
  timer?: any;
  enableDebug?: boolean;
  developerMode?: boolean;
  ui?: SDKUIOptions;
  autoConnect?: AutoConnectOptions;
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

  private walletConnect?: WalletConnect;

  private installer?: MetaMaskInstaller;

  private dappMetadata?: DappMetadata;

  private extensionActive = false;

  private _initialized = false;

  private sdkInitPromise?: Promise<void>;

  private debug = false;

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

    this.init().catch((err) => {
      console.error(`MetaMaskSDK error during initialization`, err);
    });
  }

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
      // WalletConnect
      WalletConnectInstance,
      forceRestartWalletConnect,
      // WebRTC
      webRTCLib,
      transports,
      _source,
      timer,
      // Debugging
      enableDebug = true,
      communicationServerUrl,
      autoConnect,
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

    const platform = Platform.init({
      useDeepLink: useDeeplink,
      preferredOpenLink: openDeeplink,
      wakeLockStatus: wakeLockType,
      debug: this.debug,
    });

    const platformType = platform.getPlatformType();

    if (storage?.enabled === true && !storage.storageManager) {
      storage.storageManager = getStorageManager(storage);
    }

    if (platform.isBrowser() && !dappMetadata.base64Icon) {
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
    if (
      typeof window !== 'undefined' &&
      window.ethereum &&
      !platform.isMetaMaskMobileWebView()
    ) {
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
    } else if (platform.isMetaMaskMobileWebView()) {
      this.sendSDKAnalytics(TrackingEvents.SDK_USE_INAPP_BROWSER);
      this.activeProvider = window.ethereum;
      this._initialized = true;
      return;
    }

    this.remoteConnection = new RemoteConnection({
      communicationLayerPreference,
      dappMetadata,
      webRTCLib,
      _source,
      enableDebug,
      timer,
      transports,
      communicationServerUrl,
      storage,
      autoConnect,
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

    if (WalletConnectInstance) {
      this.walletConnect = new WalletConnect({
        forceRestart: forceRestartWalletConnect ?? false,
        wcConnector: WalletConnectInstance,
      });
    }

    const installer = MetaMaskInstaller.init({
      preferDesktop: preferDesktop ?? false,
      remote: this.remoteConnection,
      debug: this.debug,
    });
    this.installer = installer;

    // Propagate up the sdk-communication events
    this.remoteConnection
      .getConnector()
      ?.on(
        EventType.CONNECTION_STATUS,
        (connectionStatus: ConnectionStatus) => {
          this.emit(EventType.CONNECTION_STATUS, connectionStatus);
        },
      );

    this.remoteConnection
      .getConnector()
      ?.on(EventType.SERVICE_STATUS, (serviceStatus: ServiceStatus) => {
        this.emit(EventType.SERVICE_STATUS, serviceStatus);
      });

    // Inject our provider into window.ethereum
    this.activeProvider = initializeProvider({
      platformType,
      communicationLayerPreference,
      sdk: this,
      checkInstallationOnAllCalls,
      injectProvider,
      shouldShimWeb3,
      installer,
      remoteConnection: this.remoteConnection,
      walletConnect: this.walletConnect,
      debug: this.debug,
    });

    window.ethereum = this.activeProvider;

    // This will check if the connection was correctly done or if the user needs to install MetaMask
    if (checkInstallationImmediately) {
      await installer.start({ wait: true });
    }

    this._initialized = true;
  }

  async connect() {
    return await this.activeProvider?.request({
      method: 'eth_requestAccounts',
      params: [],
    });
  }

  private async connectWithExtensionProvider() {
    if (this.debug) {
      console.debug(`SDK::connectWithExtensionProvider()`);
    }
    delete window.ethereum;
    // save a copy of the instance before it gets overwritten
    this.sdkProvider = this.activeProvider;
    this.activeProvider = window.extension as any;
    // Set extension provider as default on window
    window.ethereum = window.extension as any;
    // always create initial query to connect the account
    await this.activeProvider?.request({
      method: 'eth_requestAccounts',
    });
    this.extensionActive = true;
    this.emit(EventType.PROVIDER_UPDATE);
    this.sendSDKAnalytics(TrackingEvents.SDK_USE_EXTENSION);
  }

  private sendSDKAnalytics(event: TrackingEvents) {
    if (!this.options.enableDebug) {
      return;
    }

    const url = this.options.communicationServerUrl ?? DEFAULT_SERVER_URL;
    SendAnalytics(
      {
        id: Analytics.DEFAULT_ID,
        event,
        commLayerVersion: Analytics.NO_VERSION,
        originationInfo: {
          url: this.dappMetadata?.url ?? '',
          title: this.dappMetadata?.name ?? '',
          platform: Platform.getInstance().getPlatformType(),
          source: this.options._source,
        },
      },
      url,
    ).catch((err) => {
      console.error(`SDK::sendSDKAnalytics() error`, err);
    });
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
    if (Platform.getInstance().isMetaMaskMobileWebView()) {
      return;
    }

    this.emit(EventType.PROVIDER_UPDATE, []);

    // check if connected with extension provider
    // if it is, disconnect from it and switch back to injected provider
    if (this.extensionActive) {
      // Re-use default extension provider as default
      this.activeProvider = this.sdkProvider;
      window.ethereum = this.activeProvider;
      this.extensionActive = false;
      return;
    }

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

  // Get the connector object from WalletConnect
  getWalletConnectConnector() {
    if (!this.walletConnect) {
      throw new Error(`invalid`);
    }

    return this.walletConnect;
  }

  // Return the ethereum provider object
  getProvider(): SDKProvider {
    if (!this.activeProvider) {
      throw new Error(`SDK state invalid -- undefined provider`);
    }

    return this.activeProvider;
  }

  getUniversalLink() {
    const remoteLink = this.remoteConnection?.getUniversalLink();
    const wcLink = this.walletConnect?.getUniversalLink();

    const universalLink = remoteLink || wcLink;

    if (!universalLink) {
      throw new Error(
        'No Universal Link available, please call eth_requestAccounts first.',
      );
    }

    return universalLink;
  }

  // TODO: remove once reaching sdk 1.0
  // Not exposed. Should only be used during dev.
  _testStorage() {
    // return this.remoteConnection?.getConnector()?.testStorage();
    return Platform.getInstance().getPlatformType();
  }

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

declare global {
  interface Window {
    ReactNativeWebView?: WebView;
    sdkProvider: SDKProvider;
    ethereum?: SDKProvider;
    extension: unknown;
    MSStream: unknown;
  }
}
