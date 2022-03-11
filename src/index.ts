import shouldInjectProvider from './provider/shouldInject';
import initializeProvider from './provider/initializeProvider';
import setupProviderStreams from './provider/setupProviderStreams';
import portStreamToUse from './PortStreams';
import manageMetaMaskInstallation from './environmentCheck/manageMetaMaskInstallation';

interface MetaMaskSDKOptions {
  forceImportProvider?: boolean;
  forceDeleteProvider?: boolean;
  neverImportProvider?: boolean;
}
export default class MetaMaskSDK {
  constructor({
    forceImportProvider,
    forceDeleteProvider,
    neverImportProvider,
  }: MetaMaskSDKOptions = {}) {
    if (
      !neverImportProvider &&
      (forceImportProvider || shouldInjectProvider())
    ) {
      if (forceImportProvider && forceDeleteProvider) {
        delete window.ethereum;
      }

      initializeProvider();

      const PortStream = portStreamToUse();

      // It returns false if we don't need to setup a provider stream
      if (PortStream) {
        setupProviderStreams(PortStream);
      }

      // This will check if the connection was correctly done or if the user needs to install MetaMask
      manageMetaMaskInstallation();
    }
  }
}

declare global {
  interface Window {
    ReactNativeWebView: any;
    ethereum: any;
    extension: any;
  }
}
