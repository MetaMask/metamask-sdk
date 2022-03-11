import { initializeProvider as initProvider } from '@metamask/providers';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { ProviderConstants } from '../constants';
import manageMetaMaskInstallation from '../environmentCheck/manageMetaMaskInstallation';

const initializeProvider = () => {
  // Setup stream for content script communication
  const metamaskStream = new WindowPostMessageStream({
    name: ProviderConstants.INPAGE,
    target: ProviderConstants.CONTENT_SCRIPT,
  });

  // Initialize provider object (window.ethereum)
  initProvider({
    // @ts-ignore
    connectionStream: metamaskStream,
    shouldSendMetadata: false,
  });

  // Wrap ethereum.request call to check if the user needs to install MetaMask
  // eslint-disable-next-line prefer-destructuring
  const request = window.ethereum.request;
  window.ethereum.request = (...args) => {
    // This will check if the connection was correctly done or if the user needs to install MetaMask
    const isInstalled = manageMetaMaskInstallation({ wait: false });
    if (!isInstalled) {
      return new Promise((resolve, reject) =>
        reject(new Error('Wait until MetaMask is installed')),
      );
    }
    return request(...args);
  };
};

export default initializeProvider;
