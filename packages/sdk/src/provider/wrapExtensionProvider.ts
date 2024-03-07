import { MetaMaskInpageProvider } from '@metamask/providers';
import { RPC_METHODS } from '../config';
import { logger } from '../utils/logger';

function isKeyOfMetaMaskInpageProvider(
  key: PropertyKey,
): key is
  | keyof MetaMaskInpageProvider
  | 'getChainId'
  | 'getNetworkVersion'
  | 'getSelectedAddress' {
  return [
    'request',
    'getChainId',
    'getNetworkVersion',
    'getSelectedAddress',
  ].includes(key as string);
}

interface RequestArguments {
  method: string;
  params?: any[];
}

export const wrapExtensionProvider = ({
  provider,
}: {
  provider: MetaMaskInpageProvider;
}) => {
  // prevent double wrapping an invalid provider (it could happen with older web3onboard implementions)
  // TODO remove after web3onboard is updated
  if ('state' in provider) {
    throw new Error(`INVALID EXTENSION PROVIDER`);
  }

  return new Proxy(provider, {
    get(target, propKey) {
      if (isKeyOfMetaMaskInpageProvider(propKey)) {
        if (propKey === 'request') {
          return async function (args: RequestArguments) {
            logger(
              `[wrapExtensionProvider()] Overwriting request method`,
              args,
            );

            const { method, params } = args;
            // special method handling
            if (
              method === RPC_METHODS.METAMASK_BATCH &&
              Array.isArray(params)
            ) {
              // params is a list of RPCs to call
              const responses = [];
              for (const rpc of params) {
                const response = await provider?.request({
                  method: rpc.method,
                  params: rpc.params,
                });
                responses.push(response);
              }

              return responses;
            }

            return target.request(args);
          };
        } else if (propKey === 'getChainId') {
          return function () {
            return target.request({ method: 'eth_chainId' });
          };
        } else if (propKey === 'getNetworkVersion') {
          return function () {
            return target.request({ method: 'net_version' });
          };
        } else if (propKey === 'getSelectedAddress') {
          return function () {
            return target
              .request({ method: 'eth_accounts' })
              .then((accounts) => {
                return (accounts as string[])?.length
                  ? (accounts as string[])[0]
                  : null;
              });
          };
        }

        return target[propKey];
      }

      throw new Error(`Invalid property access: ${String(propKey)}`);
    },
  });
};
