import shouldInjectProvider from './provider/shouldInject';
import initializeProvider from './provider/initializeProvider';
import setupProviderStreams from './provider/setupProviderStreams';
import WalletConnect from './services/WalletConnect';
import ManageMetaMaskInstallation from './Platform/ManageMetaMaskInstallation';
import Platform, { PlatformName } from './Platform';
import Ethereum from './services/Ethereum';
import PostMessageStreams from './PostMessageStreams';
import PortStreams from './PortStreams';
import { CommunicationLayerPreference } from './constants';
import RemoteConnection from './services/RemoteConnection';

type MetaMaskSDKOptions = {
  dontInjectProvider?: boolean;
  forceImportProvider?: boolean;
  forceDeleteProvider?: boolean;
  neverImportProvider?: boolean;
  checkInstallationImmediately?: boolean;
  forceRestartWalletConnect?: boolean;
  checkInstallationOnAllCalls?: boolean;
  preferDesktop?: boolean;
  openLink?: (string) => void;
  WalletConnectInstance?: any;
  shouldShimWeb3?: boolean;
  webRTCLib?: any
  showQRCode?: any
  communicationLayerPreference?: CommunicationLayerPreference
};
export default class MetaMaskSDK {
  provider: any;

  constructor({
    // Provider
    dontInjectProvider,
    forceImportProvider,
    forceDeleteProvider,
    neverImportProvider,
    // Shim web3 on Provider
    shouldShimWeb3 = true,
    // Installation
    checkInstallationImmediately,
    checkInstallationOnAllCalls,
    // Platform settings
    preferDesktop,
    openLink,
    showQRCode,
    communicationLayerPreference = CommunicationLayerPreference.SOCKET,
    // WalletConnect
    WalletConnectInstance,
    forceRestartWalletConnect,
    // WebRTC
    webRTCLib,
  }: MetaMaskSDKOptions = {}) {
    const platform = Platform.getPlatform();

    if (
      !neverImportProvider &&
      (forceImportProvider ||
        platform === PlatformName.NonBrowser ||
        shouldInjectProvider())
    ) {
      if (forceImportProvider && forceDeleteProvider) {
        Ethereum.ethereum = null;
        delete window.ethereum;
      }

      PostMessageStreams.communicationLayerPreference = communicationLayerPreference;
      WalletConnect.WalletConnectInstance = WalletConnectInstance;
      RemoteConnection.webRTCLib = webRTCLib

      if (openLink) {
        Platform.openLink = openLink;
      }

      if(showQRCode){
        Platform.showQRCode = showQRCode
      }

      WalletConnect.forceRestart = Boolean(forceRestartWalletConnect);
      ManageMetaMaskInstallation.preferDesktop = Boolean(preferDesktop);

      // Inject our provider into window.ethereum
      this.provider = initializeProvider({
        checkInstallationOnAllCalls,
        dontInjectProvider,
        shouldShimWeb3,
      });

      // Setup provider streams, only needed for our in-app browser
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
