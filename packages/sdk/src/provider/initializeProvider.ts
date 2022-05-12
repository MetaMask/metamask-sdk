import { ProviderConstants } from '../constants';
import Platform, { isMetaMaskInstalled, PlatformName } from '../Platform';
import ManageMetaMaskInstallation from '../Platform/ManageMetaMaskInstallation';
import PostMessageStreams from '../PostMessageStreams';
import Ethereum from '../services/Ethereum';

const initializeProvider = ({
  checkInstallationOnAllCalls = false,
  injectProvider,
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
      !injectProvider ||
      // Don't inject if it's non browser
      platform === PlatformName.NonBrowser
    ),
    // @ts-ignore
    connectionStream: metamaskStream,
    shouldShimWeb3,
  });

  //@ts-ignore
  metamaskStream.start?.();

  const sendRequest = async (method, args, f) => {
    const isInstalled = isMetaMaskInstalled();

    if (!isInstalled && method !== 'metamask_getProviderState') {
      if (method === 'eth_requestAccounts' || checkInstallationOnAllCalls) {
        // Start installation and once installed try the request again
        const isConnectedNow = await ManageMetaMaskInstallation.start({
          wait: false,
        });

        // Installation/connection is now completed so we are re-sending the request
        if (isConnectedNow) {
          return f(...args);
        }
      }

      throw new Error('Wait until MetaMask is installed');
    }

    return f(...args);
  };

  // Wrap ethereum.request call to check if the user needs to install MetaMask
  const request = ethereum.request;
  ethereum.request = async (...args) => {
    return sendRequest(args?.[0].method, args, request);
  };

  const send = ethereum.send;
  ethereum.send = async (...args) => {
    return sendRequest(args?.[0], args, send);
  };

  return ethereum;
};

export default initializeProvider;
