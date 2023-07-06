import { MetaMaskInpageProvider } from '@metamask/providers';
import {
  AutoConnectOptions,
  CommunicationLayerPreference,
  ConnectionStatus,
  DappMetadata,
  EventType,
  ServiceStatus,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';
import EventEmitter2 from 'eventemitter2';
import WebView from 'react-native-webview';
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
import { shouldForceInjectProvider } from './utils/shouldForceInjectProvider';
import { shouldInjectProvider } from './utils/shouldInjectProvider';

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
  modals?: Pick<RemoteConnectionProps, 'modals'>;
  communicationServerUrl?: string;
  storage?: StorageManagerProps;
  logging?: SDKLoggingOptions;
}

export class MetaMaskSDK extends EventEmitter2 {
  private options: MetaMaskSDKOptions;

  private provider?: SDKProvider;

  private remoteConnection?: RemoteConnection;

  private walletConnect?: WalletConnect;

  private installer?: MetaMaskInstaller;

  private dappMetadata?: DappMetadata;

  private _initialized = false;

  private debug = false;

  constructor(
    options: MetaMaskSDKOptions = {
      storage: {
        enabled: false,
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
    // Currently disabled otherwise it breaks compability with older sdk version.
    // this.initialize(this.options).then(() => {
    //   if (this.debug) {
    //     console.debug(`sdk initialized`, this.dappMetadata);
    //   }
    // });

    this.initialize(this.options).catch((err) => {
      console.error(`MetaMaskSDK error during initialization`, err);
    });
  }

  private async initialize(options: MetaMaskSDKOptions) {
    const {
      dappMetadata,
      // Provider
      injectProvider = true,
      forceInjectProvider = false,
      forceDeleteProvider,
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
      timer,
      // Debugging
      enableDebug = true,
      communicationServerUrl,
      autoConnect,
      modals,
      // persistence settings
      storage,
      logging = {},
    } = options;

    if (this._initialized) {
      console.info(`SDK::initialize() already initialized.`);
      return;
    }

    const developerMode = logging?.developerMode === true;
    this.debug = logging?.sdk || developerMode;
    if (this.debug) {
      console.debug(`SDK::initialize() now`, options);
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
    const isNonBrowser = platform.isNotBrowser();

    // forceInjectProvider when flag is set or brave browser.
    const checkForceInject = shouldForceInjectProvider(forceInjectProvider);
    // check if provider was already injected (run with a window.ethereum instance)
    const checkInject = shouldInjectProvider();

    if (checkForceInject || checkInject || isNonBrowser) {
      if (checkForceInject && forceDeleteProvider) {
        Ethereum.destroy();
        // TODO re-enable once we have consolidated proxyfication of multiple providers
        // Backup the browser extension provider
        // window.extension = window.ethereum;
        delete window.ethereum;
      }

      // TODO re-enable once session persistence is activated
      if (storage?.enabled === true && !storage.storageManager) {
        storage.storageManager = getStorageManager(storage);
      }

      if (platform.isBrowser()) {
        // TODO can be re-enabled once init can be async but would break backward compatibility
        // if (!dappMetadata.base64Icon) {
        //   // Try to extract default icon
        //   if (platform.isBrowser()) {
        //     const favicon = extractFavicon();
        //     if (favicon) {
        //       try {
        //         const faviconUri = await getBase64FromUrl(favicon);
        //         dappMetadata.base64Icon = faviconUri;
        //       } catch (err) {
        //         // Ignore favicon error.
        //       }
        //     }
        //   }
        // }
      }

      this.dappMetadata = dappMetadata;

      this.remoteConnection = new RemoteConnection({
        communicationLayerPreference,
        dappMetadata,
        webRTCLib,
        enableDebug,
        timer,
        transports,
        communicationServerUrl,
        storage,
        autoConnect,
        logging: runtimeLogging,
        connectWithExtensionProvider: async () => {
          delete window.ethereum;
          this.provider = window.extension as any;
          window.ethereum = window.extension as any;
          const accounts = await window.ethereum?.request({
            method: 'eth_requestAccounts',
          });
          this.emit(EventType.PROVIDER_UPDATE, accounts);
        },
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
      this.provider = initializeProvider({
        platformType,
        communicationLayerPreference,
        checkInstallationOnAllCalls,
        injectProvider,
        shouldShimWeb3,
        installer,
        remoteConnection: this.remoteConnection,
        walletConnect: this.walletConnect,
        debug: this.debug,
      });

      // This will check if the connection was correctly done or if the user needs to install MetaMask
      if (checkInstallationImmediately) {
        await installer.start({ wait: true });
      }
    } else if (window.ethereum) {
      this.provider = window.ethereum;
    } else {
      console.error(`window.ethereum is not available.`);
      throw new Error(`Invalid SDK provider status`);
    }
    this._initialized = true;
  }

  private changeProvider() {
    return false;
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

  terminate() {
    if (this.debug) {
      console.debug(`SDK::terminate()`, this.remoteConnection);
    }

    this.remoteConnection?.disconnect({
      terminate: true,
      sendMessage: true,
    });
  }

  isInitialized() {
    return this._initialized;
  }

  ping() {
    this.remoteConnection?.getConnector()?.ping();
  }

  keyCheck() {
    this.remoteConnection?.getConnector()?.keyCheck();
  }

  // Get the connector object from WalletConnect
  getWalletConnectConnector() {
    if (!this.walletConnect) {
      throw new Error(`invalid`);
    }

    return this.walletConnect;
  }

  testStorage() {
    return this.remoteConnection?.getConnector()?.testStorage();
  }

  getChannelConfig() {
    return this.remoteConnection?.getChannelConfig();
  }

  getServiceStatus() {
    return this.remoteConnection?.getConnector()?.getServiceStatus();
  }

  getDappMetadata(): DappMetadata | undefined {
    return this.dappMetadata;
  }

  getKeyInfo() {
    return this.remoteConnection?.getKeyInfo();
  }

  resetKeys() {
    this.remoteConnection?.getConnector()?.resetKeys();
  }

  // Return the ethereum provider object
  getProvider() {
    return this.provider;
  }

  async connect() {
    return await this.provider?.request({
      method: 'eth_requestAccounts',
      params: [],
    });
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
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    ReactNativeWebView?: WebView;
    ethereum?: SDKProvider;
    extension: unknown;
    MSStream: unknown;
  }
}
