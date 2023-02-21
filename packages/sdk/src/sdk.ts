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
import { setupInAppProviderStream } from './provider/setupInAppProviderStream/setupInAppProviderStream';
import { Ethereum } from './services/Ethereum';
import { RemoteConnection } from './services/RemoteConnection';
import { WalletConnect } from './services/WalletConnect';
import { getStorageManager } from './storage-manager/getStorageManager';
import { PlatformType } from './types/PlatformType';
import { WakeLockStatus } from './types/WakeLockStatus';
import { SDKUIOptions } from './types/SDKUIOptions';
import sdkWebInstallModal from './ui/InstallModal/InstallModal-web';
import sdkWebPendingModal from './ui/InstallModal/pendinglModal-web';
import { shouldForceInjectProvider } from './utils/shouldForceInjectProvider';
import { shouldInjectProvider } from './utils/shouldInjectProvider';
import { SDKLoggingOptions } from './types/SDKLoggingOptions';
import { extractFavicon } from './utils/extractFavicon';
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
  dappMetadata?: DappMetadata;
  timer?: any;
  enableDebug?: boolean;
  developerMode?: boolean;
  ui?: SDKUIOptions;
  autoConnect?: AutoConnectOptions;
  modals?: {
    // TODO
  },
  communicationServerUrl?: string;
  storage?: StorageManagerProps;
  logging?: SDKLoggingOptions;
}

export class MetaMaskSDK extends EventEmitter2 {
  private options: MetaMaskSDKOptions;

  private provider?: MetaMaskInpageProvider;

  private remoteConnection?: RemoteConnection;

  private walletConnect?: WalletConnect;

  private installer?: MetaMaskInstaller;

  private dappMetadata?: DappMetadata;

  private debug = false;

  constructor(options: MetaMaskSDKOptions = {}) {
    super();

    this.options = options;
    this.initialize(options).then(() => {
      if(this.debug) {
        console.debug(`sdk initialized`, this.dappMetadata);
      }
    });
  }

  private async initialize(options: MetaMaskSDKOptions = {}) {
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
      // persistence settings
      storage,
      logging,
    } = options;

    const developerMode = logging?.developerMode === true;
    this.debug = logging?.sdk || developerMode;
    console.log(`sdk::initialize() now`);

    // Make sure to enable all logs if developer mode is on
    const runtimeLogging = { ...logging };

    if (developerMode) {
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
    const isNonBrowser = platformType === PlatformType.NonBrowser;

    // forceInjectProvider when flag is set or brave browser.
    const checkForceInject = shouldForceInjectProvider(forceInjectProvider);
    // check if provider was already injected (run with a window.ethereum instance)
    const checkInject = shouldInjectProvider();

    if (checkForceInject || checkInject || isNonBrowser) {
      if (checkForceInject && forceDeleteProvider) {
        Ethereum.destroy();
        delete window.ethereum;
      }

      // TODO re-enable once session persistence is activated
      if (storage && !storage.storageManager) {
        storage.storageManager = getStorageManager(storage);
      }

      if (dappMetadata && !dappMetadata.base64Icon) {
        // Try to extract default icon
        if (platform.isBrowser()) {
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
      }
      console.debug(`dappMetadagta`, dappMetadata);
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
        modals: {
          onPendingModalDisconnect: this.terminate.bind(this)
        }
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

      // Setup provider streams, only needed for our mobile in-app browser
      if (platformType === PlatformType.MetaMaskMobileWebview) {
        setupInAppProviderStream();
      }

      // This will check if the connection was correctly done or if the user needs to install MetaMask
      if (checkInstallationImmediately) {
        installer.start({ wait: true });
      }
    } else if (window.ethereum) {
      this.provider = window.ethereum;
    } else {
      console.error(`window.ethereum is not available.`);
      throw new Error(`Invalid SDK provider status`);
    }
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
    this.remoteConnection?.disconnect({ terminate: true, sendMessage: true });
    this.initialize(this.options);
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

  testUI(type: 'pending' | 'install') {
    if (type === 'pending') {
      sdkWebPendingModal(()=>{});
    } else {
      sdkWebInstallModal({ link: 'http://myprojectearn.com', debug: true });
    }
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
    ethereum?: MetaMaskInpageProvider;
    extension: unknown;
    MSStream: unknown;
  }
}
