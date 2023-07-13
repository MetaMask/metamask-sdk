import {
  CommunicationLayerPreference,
  EventType,
  PlatformType,
} from '@metamask/sdk-communication-layer';
import { METHODS_TO_REDIRECT, RPC_METHODS } from '../config';
import { ProviderConstants } from '../constants';
import { MetaMaskInstaller } from '../Platform/MetaMaskInstaller';
import { Platform } from '../Platform/Platfform';
import { getPostMessageStream } from '../PostMessageStream/getPostMessageStream';
import { Ethereum } from '../services/Ethereum';
import { RemoteConnection } from '../services/RemoteConnection';
import { WalletConnect } from '../services/WalletConnect';

// TODO refactor to be part of Ethereum class.
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
    // Don't inject if it's non browser or RN
    platformType === PlatformType.NonBrowser ||
    platformType === PlatformType.ReactNative
  );

  // ethereum.init will automatically call metamask_getProviderState
  const ethereum = Ethereum.init({
    shouldSetOnWindow,
    connectionStream: metamaskStream,
    shouldShimWeb3,
    debug,
  });

  const sendRequest = async (
    method: string,
    args: any,
    f: any,
    debugRequest: boolean,
  ) => {
    const isInstalled = Platform.getInstance().isMetaMaskInstalled();
    // Also check that socket is connected -- otherwise it would be in inconherant state.
    const socketConnected = remoteConnection?.isConnected();
    const { selectedAddress } = Ethereum.getProvider();

    if (debugRequest) {
      console.debug(
        `initializeProvider::sendRequest() method=${method} selectedAddress=${selectedAddress} isInstalled=${isInstalled} checkInstallationOnAllCalls=${checkInstallationOnAllCalls} socketConnected=${socketConnected}`,
      );
    }

    const platform = Platform.getInstance();

    if (
      (!isInstalled || (isInstalled && !socketConnected)) &&
      method !== RPC_METHODS.METAMASK_GETPROVIDERSTATE
    ) {
      if (
        method === RPC_METHODS.ETH_REQUESTACCOUNTS ||
        checkInstallationOnAllCalls
      ) {

        let isConnectedNow = false;
        try {
          // Start installation and once installed try the request again
          isConnectedNow = await installer.start({
            wait: false,
          });
        } catch(error: unknown) {
          // Special case to handle when response is interrupted because users chose browser provider
          if(error===EventType.PROVIDER_UPDATE) {
            // Re-create the query on the active provider
            return await window.ethereum?.request({
              method,
              params: args,
            });
          }
          throw error;
        }

        // Installation/connection is now completed so we are re-sending the request
        if (isConnectedNow) {
          const response = f(...args);
          return response;
        }
      } else if (platform.isSecure() && METHODS_TO_REDIRECT[method]) {
        // Should be connected to call f ==> redirect to RPCMS
        return f(...args);
      }

      if (debug) {
        console.debug(
          `initializeProvider::sendRequest() method=${method} --- skip --- not connected/installed`,
        );
      }
      throw new Error(
        'MetaMask is not connected/installed, please call eth_requestAccounts to connect first.',
      );
    }

    const rpcResponse = await f(...args);
    if (debug) {
      console.debug(
        `initializeProvider::sendRequest() method=${method} rpcResponse:`,
        rpcResponse,
      );
    }
    return rpcResponse;
  };

  // Wrap ethereum.request call to check if the user needs to install MetaMask
  const { request } = ethereum;
  // request<T>(args: RequestArguments): Promise<Maybe<T>>;
  ethereum.request = async (...args) => {
    return sendRequest(args?.[0].method, args, request, debug);
  };

  // send<T>(payload: SendSyncJsonRpcRequest): JsonRpcResponse<T>;
  const { send } = ethereum;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore // TODO remove support for deprecated method
  ethereum.send = async (...args) => {
    return sendRequest(args?.[0] as string, args, send, debug);
  };

  if (debug) {
    console.debug(`initializeProvider metamaskStream.start()`);
  }
  metamaskStream.start();
  return ethereum;
};

export default initializeProvider;
