import { ProviderConstants } from '../constants';
import Platform, { isMetaMaskInstalled, PlatformName } from '../Platform';
import ManageMetaMaskInstallation from '../Platform/ManageMetaMaskInstallation';
import PostMessageStreams from '../PostMessageStreams';
import Ethereum from '../services/Ethereum';

const initializeProvider = ({
  checkInstallationOnAllCalls = false,
  dontInjectProvider,
  shouldShimWeb3,
}) => {
  const PostMessageStream = PostMessageStreams.getPostMessageStreamToUse();

  const platform = Platform.getPlatform();

  // Setup stream for content script communication
  const metamaskStream = new PostMessageStream({
    name: ProviderConstants.INPAGE,
    target: ProviderConstants.CONTENT_SCRIPT,
  });

  // Initialize provider object (window.ethereum)
  const ethereum = Ethereum.initializeProvider({
    shouldSetOnWindow: !(
      dontInjectProvider ||
      // Don't inject if it's non browser
      platform === PlatformName.NonBrowser
    ),
    // @ts-ignore
    connectionStream: metamaskStream,
    shouldShimWeb3,
  });

  //@ts-ignore
  metamaskStream.start?.();

  // Wrap ethereum.request call to check if the user needs to install MetaMask
  // eslint-disable-next-line prefer-destructuring
  const request = ethereum.request;
  ethereum.request = async (...args) => {
    // This will check if the connection was correctly done or if the user needs to install MetaMask
    const isInstalled = isMetaMaskInstalled();

    if (!isInstalled && args?.[0]?.method !== 'metamask_getProviderState') {
      if (
        args?.[0]?.method === 'eth_requestAccounts' ||
        checkInstallationOnAllCalls
      ) {
        // Start installation and once installed try the request again
        const isConnectedNow = await ManageMetaMaskInstallation.start({
          wait: false,
        });

        console.log('IS CONNECTED NOW', isConnectedNow);

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
