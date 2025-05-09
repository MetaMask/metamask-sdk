import { analytics } from '@metamask/sdk-analytics';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { TrackingEvents } from '@metamask/sdk-communication-layer';

import { lcAnalyticsRPCs, RPC_METHODS } from '../config';
import { MetaMaskSDK } from '../sdk';
import { logger } from '../utils/logger';
import { handleBatchMethod } from './extensionProviderHelpers/handleBatchMethod';
import { handleConnectSignMethod } from './extensionProviderHelpers/handleConnectSignMethod';
import { handleConnectWithMethod } from './extensionProviderHelpers/handleConnectWithMethod';
import { getPlatformDetails } from './extensionProviderHelpers/handleUuid';

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

          const { id, from } = getPlatformDetails(sdkInstance);

          if (trackEvent) {
            sdkInstance.analytics?.send({
              event: TrackingEvents.SDK_RPC_REQUEST,
              params: {
                method,
                from,
                id,
              },
            });
          }

          if (method === RPC_METHODS.METAMASK_BATCH && Array.isArray(params)) {
            return handleBatchMethod({
              target,
              args,
              trackEvent,
              sdkInstance,
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
          let caughtError: any = null;
          try {
            resp = await target.request(args);
            return resp;
          } catch (error) {
            caughtError = error;
            throw error;
          } finally {
            if (trackEvent) {
              sdkInstance.analytics?.send({
                event: TrackingEvents.SDK_RPC_REQUEST_DONE,
                params: {
                  method,
                  from,
                  id,
                },
              });

              // Check if an error was caught OR if the response object indicates an error
              const responseIndicatesError =
                resp &&
                typeof resp === 'object' &&
                resp !== null &&
                'error' in resp;

              if (caughtError || responseIndicatesError) {
                // Determine if it's a user rejection (EIP-1193 specific code)
                const errorObj = caughtError || (resp as any)?.error;
                if (errorObj && errorObj.code === 4001) {
                  analytics.track('sdk_action_rejected', { action: method });
                } else {
                  analytics.track('sdk_action_failed', { action: method });
                }
              } else {
                analytics.track('sdk_action_succeeded', { action: method });
              }
            }
          }
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
