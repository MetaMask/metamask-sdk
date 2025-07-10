import type { RpcMethod } from './types';

//TODO: We probably want to avoid having to declare this and use the types from somewhere else
type EIP155 = {
  methods: {
    personal_sign: RpcMethod<{ message: string; account: string }, string>;
    eth_accounts: RpcMethod<void, string[]>;
    eth_chainId: RpcMethod<void, string>;
    eth_sendTransaction: RpcMethod<
      { to: string; value?: string; data?: string },
      string
    >;
    eth_call: RpcMethod<{ to: string; data?: string }, string>;
    eth_getBalance: RpcMethod<{ address: string; blockNumber: string }, string>;
    wallet_switchEthereumChain: RpcMethod<{ chainId: string }, void>;
    wallet_addEthereumChain: RpcMethod<
      {
        chainId: string;
        chainName: string;
        nativeCurrency?:
          | {
              name: string;
              symbol: string;
              decimals: number;
            }
          | undefined;
        rpcUrls: readonly string[];
        blockExplorerUrls?: string[] | undefined;
        iconUrls?: string[] | undefined;
      },
      void
    >;
    signAndSendTransaction: RpcMethod<
      { to: string; value?: string; data?: string },
      string
    >;
    signTransaction: RpcMethod<
      { to: string; value?: string; data?: string },
      string
    >;
    signMessage: RpcMethod<{ message: string }, string>;
    signIn: RpcMethod<{ message: string }, string>;
  };
  events: ['eth_subscription'];
};

export default EIP155;
