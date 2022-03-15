import shouldInjectProvider from './provider/shouldInject';
import initializeProvider from './provider/initializeProvider';
import setupProviderStreams from './provider/setupProviderStreams';
import portStreamToUse from './portStreams';
import WalletConnect from './services/WalletConnect';
import ManageMetaMaskInstallation from './environmentCheck/ManageMetaMaskInstallation';

interface MetaMaskSDKOptions {
  forceImportProvider?: boolean;
  forceDeleteProvider?: boolean;
  neverImportProvider?: boolean;
  checkInstallationImmediately?: boolean;
  forceRestartWalletConnect?: boolean;
  checkInstallationOnAllCalls?: boolean;
  preferDesktop?: boolean;
}
export default class MetaMaskSDK {
  constructor({
    forceImportProvider,
    forceDeleteProvider,
    neverImportProvider,
    checkInstallationImmediately,
    forceRestartWalletConnect,
    checkInstallationOnAllCalls,
    preferDesktop,
  }: MetaMaskSDKOptions = {}) {
    if (
      !neverImportProvider &&
      (forceImportProvider || shouldInjectProvider())
    ) {
      if (forceImportProvider && forceDeleteProvider) {
        delete window.ethereum;
      }

      WalletConnect.forceRestart = Boolean(forceRestartWalletConnect);
      ManageMetaMaskInstallation.preferDesktop = Boolean(preferDesktop);

      // Inject our provider into window.ethereum
      initializeProvider({ checkInstallationOnAllCalls });

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
  getWalletConnectConnector = () => {
    return WalletConnect.connector;
  };
}

declare global {
  interface Window {
    ReactNativeWebView: any;
    ethereum: any;
    extension: any;
  }
}
