import shouldInjectProvider from './provider/shouldInject';
import initializeProvider from './provider/initializeProvider';
import setupProviderStreams from './provider/setupProviderStreams';
import portStreamToUse from './portStreams';
import WalletConnect from './services/WalletConnect';
import ManageMetaMaskInstallation from './environmentCheck/ManageMetaMaskInstallation';
import { notBrowser } from './environmentCheck';
import Ethereum from './services/Ethereum';

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
};
export default class MetaMaskSDK {
  provider: any;

  constructor({
    dontInjectProvider,
    forceImportProvider,
    forceDeleteProvider,
    neverImportProvider,
    checkInstallationImmediately,
    forceRestartWalletConnect,
    checkInstallationOnAllCalls,
    preferDesktop,
    openLink,
    WalletConnectInstance,
    shouldShimWeb3 = true,
  }: MetaMaskSDKOptions = {}) {
    const nonBrowser = notBrowser();

    if (
      !neverImportProvider &&
      (forceImportProvider || nonBrowser || shouldInjectProvider())
    ) {
      if (forceImportProvider && forceDeleteProvider) {
        Ethereum.ethereum = null;
        delete window.ethereum;
      }

      WalletConnect.WalletConnectInstance = WalletConnectInstance;

      if (nonBrowser) {
        WalletConnect.openLink = openLink;
      }

      WalletConnect.forceRestart = Boolean(forceRestartWalletConnect);
      ManageMetaMaskInstallation.preferDesktop = Boolean(preferDesktop);

      // Inject our provider into window.ethereum
      this.provider = initializeProvider({
        checkInstallationOnAllCalls,
        dontInjectProvider,
        nonBrowser,
        shouldShimWeb3,
      });

      // Get PortStream for Mobile (either our own or Waku)
      const PortStream = portStreamToUse();

      // It returns false if we don't need to setup a provider stream
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
