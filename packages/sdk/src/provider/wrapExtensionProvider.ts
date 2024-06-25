import { MetaMaskInpageProvider } from '@metamask/providers';
import { TrackingEvents } from '@metamask/sdk-communication-layer';
import { lcAnalyticsRPCs, RPC_METHODS } from '../config';
import { MetaMaskSDK } from '../sdk';
import { logger } from '../utils/logger';
import { handleBatchMethod } from './extensionProviderHelpers/handleBatchMethod';
import { handleConnectSignMethod } from './extensionProviderHelpers/handleConnectSignMethod';
import { handleConnectWithMethod } from './extensionProviderHelpers/handleConnectWithMethod';

export interface RequestArguments {
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
            return handleBatchMethod({
              params,
              target,
              args,
              trackEvent,
              sdkInstance,
              provider,
            });
          }

          if (
            method.toLowerCase() ===
              RPC_METHODS.METAMASK_CONNECTSIGN.toLowerCase() &&
            Array.isArray(params)
          ) {
            return handleConnectSignMethod({ target, params });
          }

          if (
            method.toLowerCase() ===
              RPC_METHODS.METAMASK_CONNECTWITH.toLowerCase() &&
            Array.isArray(params)
          ) {
            return handleConnectWithMethod({ target, params });
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
