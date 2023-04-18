import { CommunicationLayerPreference } from '@metamask/sdk-communication-layer';
import { ProviderConstants } from '../constants';
import { MetaMaskInstaller } from '../Platform/MetaMaskInstaller';
import { Platform } from '../Platform/Platfform';
import { getPostMessageStream } from '../PostMessageStream/getPostMessageStream';
import { Ethereum } from '../services/Ethereum';
import { RemoteConnection } from '../services/RemoteConnection';
import { WalletConnect } from '../services/WalletConnect';
import { PlatformType } from '../types/PlatformType';

const initializeProvider = ({
  checkInstallationOnAllCalls = false,
  communicationLayerPreference,
  platformType,
  injectProvider,
  shouldShimWeb3,
  installer,
  remoteConnection,
  walletConnect,
  debug,
}: {
  communicationLayerPreference: CommunicationLayerPreference;
  checkInstallationOnAllCalls?: boolean;
  platformType: PlatformType;
  injectProvider?: boolean;
  shouldShimWeb3: boolean;
  installer: MetaMaskInstaller;
  remoteConnection?: RemoteConnection;
  walletConnect?: WalletConnect;
  debug: boolean;
}) => {
  // Setup stream for content script communication
  const metamaskStream = getPostMessageStream({
    name: ProviderConstants.INPAGE,
    target: ProviderConstants.CONTENT_SCRIPT,
    communicationLayerPreference,
    remoteConnection,
    walletConnect,
    debug,
  });

  // Initialize provider object (window.ethereum)
  const shouldSetOnWindow = !(
    !injectProvider ||
    // Don't inject if it's non browser
    platformType === PlatformType.NonBrowser
  );

  metamaskStream.start();

  const ethereum = Ethereum.init({
    shouldSetOnWindow,
    connectionStream: metamaskStream,
    shouldShimWeb3,
    debug,
  });

  const sendRequest = async (method: string, args: any, f: any) => {
    const isInstalled = Platform.getInstance().isMetaMaskInstalled();
    // Also check that socket is connected -- otherwise it would be in inconherant state.
    const socketConnected = remoteConnection?.isConnected();
    const { selectedAddress } = Ethereum.getProvider();

    if (debug) {
      console.debug(
        `initializeProvider::sendRequest() method=${method} selectedAddress=${selectedAddress} isInstalled=${isInstalled} checkInstallationOnAllCalls=${checkInstallationOnAllCalls} socketConnected=${socketConnected}`,
      );
    }

    const platform = Platform.getInstance();

    if (
      (!isInstalled || (isInstalled && !socketConnected)) &&
      method !== 'metamask_getProviderState'
    ) {
      if (method === 'eth_requestAccounts' || checkInstallationOnAllCalls) {
        // Start installation and once installed try the request again
        const isConnectedNow = await installer.start({
          wait: false,
        });

        // Installation/connection is now completed so we are re-sending the request
        if (isConnectedNow) {
          return f(...args);
        }
      } else if (platform.isSecure()) {
        // Should be connected to call f ==> redirect to RPCMS
        return f(...args);
      }

      throw new Error(
        'MetaMask is not connected/installed, please call eth_requestAccounts to connect first.',
      );
    }

    return await f(...args);
  };

  // Wrap ethereum.request call to check if the user needs to install MetaMask
  const { request } = ethereum;
  ethereum.request = async (...args) => {
    return sendRequest(args?.[0].method, args, request);
  };

  const { send } = ethereum;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore // TODO remove support for deprecated method
  ethereum.send = async (...args) => {
    return sendRequest(args?.[0] as string, args, send);
  };

  return ethereum;
};

export default initializeProvider;
