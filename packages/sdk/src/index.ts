import shouldInjectProvider from './provider/shouldInject';
import initializeProvider from './provider/initializeProvider';
import setupProviderStreams from './provider/setupProviderStreams';
import WalletConnect from './services/WalletConnect';
import ManageMetaMaskInstallation from './Platform/ManageMetaMaskInstallation';
import Platform, { PlatformName } from './Platform';
import Ethereum from './services/Ethereum';
import PostMessageStreams from './PostMessageStreams';
import PortStreams from './PortStreams';
import { CommunicationLayerPreference } from '@metamask/sdk-communication-layer';
import RemoteConnection from './services/RemoteConnection';

type MetaMaskSDKOptions = {
  injectProvider?: boolean;
  forceInjectProvider?: boolean;
  forceDeleteProvider?: boolean;
  checkInstallationImmediately?: boolean;
  forceRestartWalletConnect?: boolean;
  checkInstallationOnAllCalls?: boolean;
  preferDesktop?: boolean;
  openDeeplink?: (string) => void;
  useDeeplink?: boolean,
  WalletConnectInstance?: any;
  shouldShimWeb3?: boolean;
  webRTCLib?: any
  communicationLayerPreference?: CommunicationLayerPreference
};
export default class MetaMaskSDK {
  provider: any;

  constructor({
    // Provider
    injectProvider = true,
    forceInjectProvider,
    forceDeleteProvider,
    // Shim web3 on Provider
    shouldShimWeb3 = true,
    // Installation
    checkInstallationImmediately,
    checkInstallationOnAllCalls,
    // Platform settings
    preferDesktop,
    openDeeplink,
    useDeeplink,
    communicationLayerPreference = CommunicationLayerPreference.SOCKET,
    // WalletConnect
    WalletConnectInstance,
    forceRestartWalletConnect,
    // WebRTC
    webRTCLib,
  }: MetaMaskSDKOptions = {}) {
    const platform = Platform.getPlatform();

    if (
      (forceInjectProvider ||
        platform === PlatformName.NonBrowser ||
        shouldInjectProvider())
    ) {
      if (forceInjectProvider && forceDeleteProvider) {
        Ethereum.ethereum = null;
        delete window.ethereum;
      }

      PostMessageStreams.communicationLayerPreference = communicationLayerPreference;
      WalletConnect.WalletConnectInstance = WalletConnectInstance;
      RemoteConnection.webRTCLib = webRTCLib

      if (openDeeplink) {
        Platform.preferredOpenLink = openDeeplink;
      }

      if(useDeeplink){
        Platform.useDeeplink = useDeeplink
      }

      WalletConnect.forceRestart = Boolean(forceRestartWalletConnect);
      ManageMetaMaskInstallation.preferDesktop = Boolean(preferDesktop);

      // Inject our provider into window.ethereum
      this.provider = initializeProvider({
        checkInstallationOnAllCalls,
        injectProvider,
        shouldShimWeb3,
      });

      // Setup provider streams, only needed for our mobile in-app browser
      const PortStream = PortStreams.getPortStreamToUse();
      if (PortStream) {
        setupProviderStreams(PortStream);
      }

      // This will check if the connection was correctly done or if the user needs to install MetaMask
      if (checkInstallationImmediately) {
        ManageMetaMaskInstallation.start({ wait: true });
      }
    }
  }

  // Get the connector object from WalletConnect
  getWalletConnectConnector() {
    return WalletConnect.getConnector();
  }

  // Return the ethereum provider object
  getProvider() {
    return this.provider;
  }
}

declare global {
  interface Window {
    ReactNativeWebView: any;
    ethereum: any;
    extension: any;
  }
}
