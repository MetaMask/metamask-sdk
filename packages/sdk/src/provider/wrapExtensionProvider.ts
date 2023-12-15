import { MetaMaskInpageProvider } from '@metamask/providers';
import { RPC_METHODS } from '../config';

interface RequestArguments {
  method: string;
  params?: any[];
}

export const wrapExtensionProvider = ({
  provider,
  debug,
}: {
  provider: MetaMaskInpageProvider;
  debug?: boolean;
}) => {
  // prevent double wrapping an invalid provider (it could happen with older web3onboard implementions)
  // TODO remove after web3onboard is updated
  if ('state' in provider) {
    throw new Error(`INVALID EXTENSION PROVIDER`);
  }

  return new Proxy(provider, {
    get(target, propKey: keyof MetaMaskInpageProvider) {
      if (propKey === 'request') {
        return async function (args: RequestArguments) {
          if (debug) {
            console.debug(
              '[wrapExtensionProvider] Overwriting request method, args:',
              args,
            );
          }

          const { method, params } = args;
          // special method handling
          if (method === RPC_METHODS.METAMASK_BATCH && Array.isArray(params)) {
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
      }
      return target[propKey];
    },
  });
};
