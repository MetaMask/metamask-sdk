import { MetaMaskInpageProvider } from '@metamask/providers';
import { TrackingEvents } from '@metamask/sdk-communication-layer';
import { lcAnalyticsRPCs, RPC_METHODS, rpcWithAccountParam } from '../config';
import { MetaMaskSDK } from '../sdk';
import { logger } from '../utils/logger';

interface RequestArguments {
  method: string;
  params?: any[];
}

export const wrapExtensionProvider = ({
  provider,
  sdkInstance,
}: {
  provider: MetaMaskInpageProvider;
  sdkInstance: MetaMaskSDK;
}) => {
  if ('state' in provider) {
    throw new Error('INVALID EXTENSION PROVIDER');
  }

  const handleBatchMethod = async (
    params: any[],
    target: any,
    args: RequestArguments,
    trackEvent: boolean,
  ) => {
    // params is a list of RPCs to call
    const responses = [];
    for (const rpc of params) {
      const response = await provider?.request({
        method: rpc.method,
        params: rpc.params,
      });
      responses.push(response);
    }

    const resp = await target.request(args);
    if (trackEvent) {
      sdkInstance.analytics?.send({
        event: TrackingEvents.SDK_RPC_REQUEST_DONE,
        params: { method: args.method, from: 'extension' },
      });
    }
    return resp;
  };

  const handleConnectSignMethod = async (target: any, params: any[]) => {
    const accounts = (await target.request({
      method: RPC_METHODS.ETH_REQUESTACCOUNTS,
      params: [],
    })) as string[];

    if (!accounts.length) {
      throw new Error('SDK state invalid -- undefined accounts');
    }

    return await target.request({
      method: RPC_METHODS.PERSONAL_SIGN,
      params: [params[0], accounts[0]],
    });
  };

  const handleConnectWithMethod = async (target: any, params: any[]) => {
    const [rpc] = params;
    const currentRpcMethod = rpc.method;
    const currentRpcParams = rpc.params;
    const accounts = (await target.request({
      method: RPC_METHODS.ETH_REQUESTACCOUNTS,
      params: [],
    })) as string[];

    if (!accounts.length) {
      throw new Error('SDK state invalid -- undefined accounts');
    }

    if (
      currentRpcMethod?.toLowerCase() ===
      RPC_METHODS.PERSONAL_SIGN.toLowerCase()
    ) {
      return await target.request({
        method: currentRpcMethod,
        params: [currentRpcParams[0], accounts[0]],
      });
    } else if (
      currentRpcMethod?.toLowerCase() ===
      RPC_METHODS.ETH_SENDTRANSACTION.toLowerCase()
    ) {
      return await target.request({
        method: currentRpcMethod,
        params: [{ ...currentRpcParams[0], from: accounts[0] }],
      });
    }

    if (rpcWithAccountParam.includes(currentRpcMethod.toLowerCase())) {
      console.warn(
        `MetaMaskSDK connectWith method=${currentRpcMethod} -- not handled by the extension -- call separately`,
      );
      return accounts;
    }

    return await target.request({
      method: currentRpcMethod,
      params: currentRpcParams,
    });
  };

  return new Proxy(provider, {
    get(target, propKey) {
      if (propKey === 'request') {
        return async function (args: RequestArguments) {
          logger(`[wrapExtensionProvider()] Overwriting request method`, args);

          const { method, params } = args;
          const trackEvent = lcAnalyticsRPCs.includes(method.toLowerCase());

          if (trackEvent) {
            sdkInstance.analytics?.send({
              event: TrackingEvents.SDK_RPC_REQUEST,
              params: { method, from: 'extension' },
            });
          }

          if (method === RPC_METHODS.METAMASK_BATCH && Array.isArray(params)) {
            return handleBatchMethod(params, target, args, trackEvent);
          }

          if (
            method.toLowerCase() ===
              RPC_METHODS.METAMASK_CONNECTSIGN.toLowerCase() &&
            Array.isArray(params)
          ) {
            return handleConnectSignMethod(target, params);
          }

          if (
            method.toLowerCase() ===
              RPC_METHODS.METAMASK_CONNECTWITH.toLowerCase() &&
            Array.isArray(params)
          ) {
            return handleConnectWithMethod(target, params);
          }

          let resp;
          try {
            resp = await target.request(args);
            return resp;
          } catch (error) {
            // Ignore user rejected request
          } finally {
            if (trackEvent) {
              sdkInstance.analytics?.send({
                event: TrackingEvents.SDK_RPC_REQUEST_DONE,
                params: { method, from: 'extension' },
              });
            }
          }
          return resp;
        };
      } else if (propKey === 'getChainId') {
        return function () {
          return provider.chainId;
        };
      } else if (propKey === 'getNetworkVersion') {
        return function () {
          return provider.networkVersion;
        };
      } else if (propKey === 'getSelectedAddress') {
        return function () {
          return provider.selectedAddress;
        };
      } else if (propKey === 'isConnected') {
        return function () {
          // TODO: allowed because of issue on inpavge provider
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return provider._state.isConnected;
        };
      }

      return target[propKey as keyof MetaMaskInpageProvider];
    },
  });
};
