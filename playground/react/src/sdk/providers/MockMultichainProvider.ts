import type { Provider } from './Provider';

const callbacks: ((message: any) => void)[] = [];

const makeProvider = (getSession: () => any): Provider => {
  const notify = (message: any) => {
    callbacks.forEach((callback) => {
      callback(message);
    });
  };

  // Function to simulate MetaMask provider
  const provider: Provider = {
    connect: async (_: string) => {
      return Promise.resolve(true);
    },
    disconnect: () => {
      return true;
    },
    request: async ({ method, params }: { method: string; params: any }) => {
      console.log(`Calling ${method} with params:`, params);
      // Simulate responses based on method
      switch (method) {
        case 'wallet_createSession':
          notify({
            jsonrpc: '2.0',
            method: 'wallet_notify',
            params: {
              'eip155:1': {
                method: 'eth_subscription',
                params: {
                  subscription: '0xfoo',
                  result: {
                    blockNumber: '0x1',
                  },
                },
              },
            },
          });
          notify({
            jsonrpc: '2.0',
            method: 'wallet_sessionChanged',
            params: params.requiredScopes,
          });
          return {
            sessionScopes: params.requiredScopes,
          };
        case 'wallet_getSession':
          return getSession();
        case 'wallet_revokeSession':
          return true;
        case 'wallet_invokeMethod':
          return 'Method invocation result';
        default:
          throw new Error('Method not implemented');
      }
    },
    onNotification: (callback: (message: any) => void) => {
      callbacks.push(callback);
    },
    removeAllNotificationListeners: () => {
      // no op
    },
    removeNotificationListener(_: (notification: any) => void): void {
      throw new Error('Function not implemented.');
    },
  };
  return provider;
};

export default makeProvider;
