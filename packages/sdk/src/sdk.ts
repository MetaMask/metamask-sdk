import { MetaMaskInpageProvider } from '@metamask/providers';
import {
  CommunicationLayerPreference,
  ConnectionStatus,
  DappMetadata,
  MessageType,
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
import { PlatformType } from './types/PlatformType';
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
  dappMetadata?: DappMetadata;
  timer?: any;
  enableDebug?: boolean;
  developerMode?: boolean;
  communicationServerUrl?: string;
  // storage?: StorageManagerProps;
}

export class MetaMaskSDK extends EventEmitter2 {
  private provider: MetaMaskInpageProvider;

  private remoteConnection?: RemoteConnection;

  private walletConnect?: WalletConnect;

  private installer?: MetaMaskInstaller;

  private dappMetadata?: DappMetadata;

  private developerMode = false;

  constructor({
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
    developerMode = false,
    communicationServerUrl,
  }: MetaMaskSDKOptions = {}) {
    super();

    this.developerMode = developerMode;

    const platform = Platform.init({
      useDeepLink: useDeeplink,
      preferredOpenLink: openDeeplink,
      wakeLockStatus: wakeLockType,
      debug: this.developerMode,
    });

    this.dappMetadata = dappMetadata;
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
      // if (storage && !storage.storageManager) {
      //   storage.storageManager = getStorageManager(storage);
      // }

      this.remoteConnection = new RemoteConnection({
        communicationLayerPreference,
        dappMetadata,
        webRTCLib,
        enableDebug,
        timer,
        transports,
        communicationServerUrl,
        developerMode: this.developerMode,
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
        debug: this.developerMode,
      });

      // Bubble up the connection status event.
      this.remoteConnection
        .getConnector()
        ?.on(
          MessageType.CONNECTION_STATUS,
          (connectionStatus: ConnectionStatus) => {
            this.emit(MessageType.CONNECTION_STATUS, connectionStatus);
          },
        );

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
        debug: this.developerMode,
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

  disconnect() {
    this.remoteConnection?.disconnect();
  }

  terminate() {
    this.remoteConnection?.disconnect({ terminate: true });
  }

  // Get the connector object from WalletConnect
  getWalletConnectConnector() {
    if (!this.walletConnect) {
      throw new Error(`invalid`);
    }

    return this.walletConnect;
  }

  testStorage() {
    return this.remoteConnection?.getConnector().testStorage();
  }

  getChannelConfig() {
    return this.remoteConnection?.getChannelConfig();
  }

  getDappMetadata(): DappMetadata | undefined {
    return this.dappMetadata;
  }

  getKeyInfo() {
    return this.remoteConnection?.getKeyInfo();
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
