import {
  CommunicationLayerPreference,
  EventType,
  PlatformType,
} from '@metamask/sdk-communication-layer';
import packageJson from '../../package.json';
import { MetaMaskInstaller } from '../Platform/MetaMaskInstaller';
import { PlatformManager } from '../Platform/PlatfformManager';
import { getPostMessageStream } from '../PostMessageStream/getPostMessageStream';
import { METHODS_TO_REDIRECT, RPC_METHODS } from '../config';
import { ProviderConstants } from '../constants';
import { MetaMaskSDK } from '../sdk';
import { Ethereum } from '../services/Ethereum';
import { RemoteConnection } from '../services/RemoteConnection';
import { rpcRequestHandler } from '../services/rpc-requests/RPCRequestHandler';
import { PROVIDER_UPDATE_TYPE } from '../types/ProviderUpdateType';
import { wait } from '../utils/wait';

const initializeMobileProvider = ({
  checkInstallationOnAllCalls = false,
  communicationLayerPreference,
  injectProvider,
  shouldShimWeb3,
  platformManager,
  installer,
  sdk,
  remoteConnection,
  debug,
}: {
  communicationLayerPreference: CommunicationLayerPreference;
  checkInstallationOnAllCalls?: boolean;
  injectProvider?: boolean;
  shouldShimWeb3: boolean;
  sdk: MetaMaskSDK;
  platformManager: PlatformManager;
  installer: MetaMaskInstaller;
  remoteConnection?: RemoteConnection;
  debug: boolean;
}) => {
  // Setup stream for content script communication
  const metamaskStream = getPostMessageStream({
    name: ProviderConstants.INPAGE,
    target: ProviderConstants.CONTENT_SCRIPT,
    platformManager,
    communicationLayerPreference,
    remoteConnection,
    debug,
  });

  const platformType = platformManager.getPlatformType();
  const dappInfo = sdk.options.dappMetadata;
  const sdkInfo = `Sdk/Javascript SdkVersion/${
    packageJson.version
  } Platform/${platformType} dApp/${dappInfo.url ?? dappInfo.name}`;

  let cachedAccountAddress: string | null = null;
  let cachedChainId: string | null = null;

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

  let initializationOngoing = false;
  const setInitializing = (ongoing: boolean) => {
    initializationOngoing = ongoing;
  };

  const getInitializing = () => {
    return initializationOngoing;
  };

  const sendRequest = async (
    method: string,
    args: any,
    f: any,
    debugRequest: boolean,
  ) => {
    if (initializationOngoing) {
      // make sure the active modal is displayed
      remoteConnection?.showActiveModal();

      let loop = getInitializing();
      while (loop) {
        // Wait for already ongoing method that triggered installation to complete
        await wait(1000);
        loop = getInitializing();
      }

      if (debug) {
        console.debug(
          `initializeProvider::sendRequest() initial method completed -- prevent installation and call provider`,
        );
      }
      // Previous init has completed, meaning we can safely interrup and call the provider.
      return f(...args);
    }

    const isInstalled = platformManager.isMetaMaskInstalled();
    // Also check that socket is connected -- otherwise it would be in inconherant state.
    const socketConnected = remoteConnection?.isConnected();
    let { selectedAddress, chainId } = Ethereum.getProvider();

    selectedAddress = selectedAddress ?? cachedAccountAddress;
    chainId = chainId ?? cachedChainId ?? sdk.defaultReadOnlyChainId;

    // keep cached values for selectedAddress and chainId
    if (selectedAddress) {
      cachedAccountAddress = selectedAddress;
    }

    if (chainId) {
      cachedChainId = chainId;
    }

    if (debugRequest) {
      console.debug(
        `initializeProvider::sendRequest() method=${method} ongoing=${initializationOngoing} selectedAddress=${selectedAddress} isInstalled=${isInstalled} checkInstallationOnAllCalls=${checkInstallationOnAllCalls} socketConnected=${socketConnected}`,
      );
    }

    // Special case for eth_accounts to allow working with read-only RPC
    if (
      selectedAddress &&
      method.toLowerCase() === RPC_METHODS.ETH_ACCOUNTS.toLowerCase()
    ) {
      return [selectedAddress];
    }

    // Special case for eth_chainId to allow working with read-only RPC
    if (
      chainId &&
      method.toLowerCase() === RPC_METHODS.ETH_CHAINID.toLowerCase()
    ) {
      return chainId;
    }

    const ALLOWED_CONNECT_METHODS = [
      RPC_METHODS.ETH_REQUESTACCOUNTS,
      RPC_METHODS.METAMASK_CONNECTSIGN,
      RPC_METHODS.METAMASK_CONNECTWITH,
    ];

    // is it a readonly method with infura supported chain?
    const isReadOnlyMethod = !METHODS_TO_REDIRECT[method];
    const rpcEndpoint = sdk.options.readonlyRPCMap?.[chainId as `0x${string}`];
    if (rpcEndpoint && isReadOnlyMethod) {
      try {
        const params = args?.[0]?.params;
        const readOnlyResponse = await rpcRequestHandler({
          rpcEndpoint,
          sdkInfo,
          method,
          params: params || [],
        });

        if (debugRequest) {
          console.log(
            `initializeProvider::ReadOnlyRPCResponse`,
            readOnlyResponse,
          );
        }
        return readOnlyResponse;
      } catch (err) {
        // Log error and fallback to mobile provider
        console.warn(
          `initializeProvider::sendRequest() method=${method} readOnlyRPCRequest failed:`,
          err,
        );
      }
    }

    if (
      (!isInstalled || (isInstalled && !socketConnected)) &&
      method !== RPC_METHODS.METAMASK_GETPROVIDERSTATE
    ) {
      if (
        ALLOWED_CONNECT_METHODS.indexOf(method) !== -1 ||
        checkInstallationOnAllCalls
      ) {
        setInitializing(true);

        try {
          // installer modal display but doesn't mean connection is auhtorized
          await installer.start({
            wait: false,
          });
        } catch (installError) {
          setInitializing(false);

          if (PROVIDER_UPDATE_TYPE.EXTENSION === installError) {
            if (debug) {
              console.debug(
                `initializeProvider extension provider detect: re-create ${method} on the active provider`,
              );
            }

            // Special case for metamask_connectSign, split the request in 2 parts (connect + sign)
            if (
              method.toLowerCase() ===
              RPC_METHODS.METAMASK_CONNECTSIGN.toLowerCase()
            ) {
              const [temp] = args;
              const { params } = temp;
              const accounts = (await sdk.getProvider()?.request({
                method: RPC_METHODS.ETH_REQUESTACCOUNTS,
                params: [],
              })) as string[];
              if (!accounts.length) {
                throw new Error(`SDK state invalid -- undefined accounts`);
              }

              return await sdk.getProvider()?.request({
                method: RPC_METHODS.PERSONAL_SIGN,
                params: [params[0], accounts[0]],
              });
            } else if (
              method.toLowerCase() ===
              RPC_METHODS.METAMASK_CONNECTWITH.toLowerCase()
            ) {
              const [temp] = args;
              const { params } = temp;
              const accounts = (await sdk.getProvider()?.request({
                method: RPC_METHODS.ETH_REQUESTACCOUNTS,
                params: [],
              })) as string[];
              if (!accounts.length) {
                throw new Error(`SDK state invalid -- undefined accounts`);
              }

              const { rpc } = params;
              console.warn(`FIXME:: handle CONNECT_WITH`, rpc);

              if (
                rpc.method?.toLowerCase() ===
                RPC_METHODS.PERSONAL_SIGN.toLowerCase()
              ) {
                const connectedRpc = {
                  method: rpc.method,
                  params: [rpc.params[0], accounts[0]],
                };
                console.log(`connectWith:: connectedRpc`, connectedRpc);
                return await sdk.getProvider()?.request(connectedRpc);
              }
              console.warn(`FIXME:: handle CONNECT_WITH`, rpc);
            }

            // Re-create the query on the active provider
            return await sdk.getProvider()?.request({
              method,
              params: args,
            });
          }

          if (debug) {
            console.debug(
              `initializeProvider failed to start installer: ${installError}`,
            );
          }

          throw installError;
        }

        // Initialize the request (otherwise the rpc call is not sent)
        const response = f(...args);

        // Wait for the provider to be initialized so we can process requests
        try {
          await new Promise((resolve, reject) => {
            remoteConnection?.getConnector().once(EventType.AUTHORIZED, () => {
              resolve(true);
            });

            // Also detect changes of provider
            sdk.once(
              EventType.PROVIDER_UPDATE,
              (type: PROVIDER_UPDATE_TYPE) => {
                if (debug) {
                  console.debug(
                    `initializeProvider::sendRequest() PROVIDER_UPDATE --- remote provider request interupted`,
                    type,
                  );
                }

                if (type === PROVIDER_UPDATE_TYPE.EXTENSION) {
                  reject(EventType.PROVIDER_UPDATE);
                } else {
                  reject(new Error('Connection Terminated'));
                }
              },
            );
          });
        } catch (err: unknown) {
          setInitializing(false);
          if (err === EventType.PROVIDER_UPDATE) {
            // Re-create the query on the active provider
            return await sdk.getProvider()?.request({
              method,
              params: args,
            });
          }
          throw err;
        }

        setInitializing(false);

        return response;
      } else if (platformManager.isSecure() && METHODS_TO_REDIRECT[method]) {
        // Should be connected to call f ==> redirect to RPCMS
        return f(...args);
      }

      if (sdk.isExtensionActive()) {
        // It means there was a switch of provider while waiting for initialization -- redirect to the extension.
        if (debug) {
          console.debug(
            `initializeProvider::sendRequest() EXTENSION active - redirect request '${method}' to it`,
          );
        }

        // redirect to extension
        return await sdk.getProvider()?.request({
          method,
          params: args,
        });
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

export default initializeMobileProvider;
