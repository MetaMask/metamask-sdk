import { RPC_METHODS } from '../config';
import { SDKProvider } from './SDKProvider';

interface RequestArguments {
  method: string;
  params?: any[];
  // add any other necessary properties
}

export const wrapExtensionProvider = (provider: SDKProvider) => {
  return new Proxy(provider, {
    get(target, propKey: keyof SDKProvider) {
      if (propKey === 'request') {
        return async function (args: RequestArguments) {
          console.log('Overwriting request method, args:', args);

          const { method, params } = args;
          // special method handling
          if (
            method === RPC_METHODS.METAMASK_CHAINRPCS &&
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
      }
      return target[propKey];
    },
  });
};
