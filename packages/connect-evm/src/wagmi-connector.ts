/**
 * Draft wagmi connector for Metamask SDK
 * Not supposed to leave in this repo, just here for reference
 **/
import { type MetaMaskSDKOptions } from '@metamask/sdk';

import {
  type MultichainCore,
  type SDKState,
  type SessionData,
} from '@metamask/multichain-sdk';

import { createEVMLayer, MetamaskConnectEVM } from '@metamask/connect-evm';

import {
  ChainNotConfiguredError,
  type Connector,
  createConnector,
  extractRpcUrls,
  ProviderNotFoundError,
} from '@wagmi/core';
import type {
  Compute,
  ExactPartial,
  OneOf,
  RemoveUndefined,
  UnionCompute,
} from '@wagmi/core/internal';
import {
  type AddEthereumChainParameter,
  type Address,
  getAddress,
  type Hex,
  hexToNumber,
  numberToHex,
  type ProviderConnectInfo,
  type ProviderRpcError,
  ResourceUnavailableRpcError,
  type RpcError,
  SwitchChainError,
  UserRejectedRequestError,
  withRetry,
  withTimeout,
} from 'viem';

type MetaMaskSDK = MultichainCore;

export type MetaMaskParameters = UnionCompute<
  WagmiMetaMaskSDKOptions &
    OneOf<
      | {
          /* Shortcut to connect and sign a message */
          connectAndSign?: string | undefined;
        }
      | {
          // TODO: Strongly type `method` and `params`
          /* Allow `connectWith` any rpc method */
          connectWith?: { method: string; params: unknown[] } | undefined;
        }
    >
>;

type WagmiMetaMaskSDKOptions = Compute<
  ExactPartial<
    Omit<
      MetaMaskSDKOptions,
      | '_source'
      | 'forceDeleteProvider'
      | 'forceInjectProvider'
      | 'injectProvider'
      | 'useDeeplink'
      | 'readonlyRPCMap'
    >
  > & {
    /** @deprecated */
    forceDeleteProvider?: MetaMaskSDKOptions['forceDeleteProvider'];
    /** @deprecated */
    forceInjectProvider?: MetaMaskSDKOptions['forceInjectProvider'];
    /** @deprecated */
    injectProvider?: MetaMaskSDKOptions['injectProvider'];
    /** @deprecated */
    useDeeplink?: MetaMaskSDKOptions['useDeeplink'];
  }
>;

metaMask.type = 'metaMask' as const;
export function metaMask(parameters: MetaMaskParameters = {}) {
  type Provider = MetaMaskSDK['provider'];
  type Properties = {
    onConnect(connectInfo: ProviderConnectInfo): void;
    onDisplayUri(uri: string): void;
  };
  type Listener = Parameters<Provider['on']>[1];

  let sdk: MetamaskConnectEVM;
  let provider: Provider | undefined;
  let providerPromise: Promise<typeof provider>;

  let accountsChanged: Connector['onAccountsChanged'] | undefined;
  let chainChanged: Connector['onChainChanged'] | undefined;
  let connect: Connector['onConnect'] | undefined;
  let displayUri: ((uri: string) => void) | undefined;
  let disconnect: Connector['onDisconnect'] | undefined;
  let sessionData: SessionData | undefined;
  let sdkState: SDKState | undefined;

  return createConnector<Provider, Properties>((config) => ({
    id: 'metaMaskSDK',
    name: 'MetaMask',
    rdns: ['io.metamask', 'io.metamask.mobile'],
    type: metaMask.type,
    async setup() {
      console.log('Running Metamask Setup');

      sdk = await createEVMLayer({
        dapp: {
          name: parameters.dappMetadata?.name,
          url: parameters.dappMetadata?.url,
        },
      });

      console.log('SDK created');

      console.log({ sdk });
      const provider = await sdk.getProvider();
      console.log({ provider });

      if (provider?.on) {
        // if (!connect) {
        //   //connect = this.onConnect.bind(this)
        //   provider.on('connect', connect as Listener)
        // }

        // We shouldn't need to listen for `'accountsChanged'` here since the `'connect'` event should suffice (and wallet shouldn't be connected yet).
        // Some wallets, like MetaMask, do not implement the `'connect'` event and overload `'accountsChanged'` instead.
        if (!accountsChanged) {
          accountsChanged = this.onAccountsChanged.bind(this);
          provider.on('accountsChanged', accountsChanged as Listener);
        }
      }
    },
    async connect({ chainId, isReconnecting, withCapabilities } = {}) {
      const connectResult = await sdk.connect({
        chainId: chainId ?? 1,
        account: undefined,
      } as { chainId: number; account: string });
      console.log({ connectResult });
      return connectResult;
    },
    async disconnect() {
      return sdk.disconnect();
    },
    async getAccounts() {
      return [sdk.getAccount()];
    },
    async getChainId() {
      const chainId = await sdk.getChainId();
      if (chainId) {
        return parseInt(chainId, 16);
      }
      return 1;
    },
    async getProvider() {
      return sdk.getProvider();
    },

    async isAuthorized() {
      const accounts = await this.getAccounts();
      return accounts.length > 0;
    },

    async switchChain({ chainId }) {},
    async onAccountsChanged(accounts) {},
    async onChainChanged(chainId) {},
    async onConnect(connectInfo) {
      config.emitter.emit('connect', {});
    },
    async onDisconnect(error) {},
    async onDisplayUri(uri) {},
  }));
}
