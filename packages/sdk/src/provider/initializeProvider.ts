import { initializeProvider as initProvider } from '@metamask/providers';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { ProviderConstants } from '../constants';
import { isMetaMaskInstalled } from '../environmentCheck';
import ManageMetaMaskInstallation from '../environmentCheck/ManageMetaMaskInstallation';

const initializeProvider = ({
  checkInstallationOnAllCalls = false,
  dontInjectProvider
}) => {
  // Setup stream for content script communication
  const metamaskStream = new WindowPostMessageStream({
    name: ProviderConstants.INPAGE,
    target: ProviderConstants.CONTENT_SCRIPT,
  });

  // Initialize provider object (window.ethereum)
  const ethereum = initProvider({
    shouldSetOnWindow: !dontInjectProvider,
    // @ts-ignore
    connectionStream: metamaskStream,
    shouldSendMetadata: false,
    shouldShimWeb3: true
  });

  // Wrap ethereum.request call to check if the user needs to install MetaMask
  // eslint-disable-next-line prefer-destructuring
  const request = ethereum.request;
  ethereum.request = async (...args) => {
    // This will check if the connection was correctly done or if the user needs to install MetaMask
    const isInstalled = isMetaMaskInstalled(ethereum);

    if (!isInstalled) {
      if (
        args[0]?.method === 'eth_requestAccounts' ||
        checkInstallationOnAllCalls
      ) {
        // Start installation and once installed try the request again
        const isConnectedNow = await ManageMetaMaskInstallation.start({
          wait: false,
        });

        // Installation/connection is now completed so we are sending the request
        if (isConnectedNow) {
          return request(...args);
        }
      }

      throw new Error('Wait until MetaMask is installed');
    }
    return request(...args);
  };

  return ethereum;
};

export default initializeProvider;
