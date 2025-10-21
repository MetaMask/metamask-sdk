// @ts-nocheck
import {
  createMetamaskSDK,
  MultichainOptions,
  MultichainCore,
  Scope,
  RPCAPI,
  SessionData,
} from '@metamask/multichain-sdk';
import { EIP1193Provider, EIP155 } from './provider';
import { getEthAccounts } from './utils/get-eth-accounts';
import { Address } from './types';

type CaipAccountId = `${string}:${string}:${string}`;

type MinimalEventEmitter = Pick<EIP1193Provider, 'on' | 'off' | 'emit'>;

type EventHandlers = {
  accountsChanged: (accounts: string[]) => void;
  chainChanged: (chainId: string) => void;
};

type MetamaskConnectEVMOptions = {
  core: MultichainCore;
  eventEmitter?: MinimalEventEmitter;
  eventHandlers?: EventHandlers;
};

export class MetamaskConnectEVM {
  /** The core instance of the Multichain SDK */
  private core: MultichainCore;

  /** The currently selected chain ID on the wallet */
  private currentChainId?: number;

  /** The currently selected account on the wallet */
  private currentAccount?: Address;

  accounts: Address[] = [];

  /** An instance of the EIP-1193 provider interface */
  private provider: EIP1193Provider;

  /** An event emitter for the EIP-1193 provider. Default to the provider instance*/
  private eventEmitter: MinimalEventEmitter;

  /** The session scopes currently permitted */
  private sessionScopes: SessionData['sessionScopes'] = {};

  /** Optional event handlers for the EIP-1193 provider events. */
  private eventHandlers?: EventHandlers;

  constructor({
    core,
    eventEmitter,
    eventHandlers,
  }: MetamaskConnectEVMOptions) {
    console.log('MetamaskConnectEVM constructor starts');
    this.core = core;
    this.provider = new EIP1193Provider(core);
    this.eventEmitter = eventEmitter ?? {};
    this.eventHandlers = eventHandlers;

    this.core.on('wallet_sessionChanged', (session) => {
      console.log('wallet_sessionChanged', session);
      this.sessionScopes = session?.sessionScopes ?? {};

      const ethAccounts = getEthAccounts(this.sessionScopes);
      this.currentAccount = ethAccounts[0];
      this.accounts = ethAccounts;
    });

    // Setup the event listener for the wallet's EIP-1193 accountsChanged event
    window.addEventListener('message', (event: unknown) => {
      if (
        event?.data?.data?.name === 'metamask-provider' &&
        event.origin === location.origin
      ) {
        const data = event?.data?.data?.data;
        if (data?.method === 'metamask_chainChanged') {
          const chainId = Number(data?.params.chainId);
          console.log('metamask_chainChanged', { chainId });
          this.currentChainId = chainId;
          // TODO: (@wenfix): better setter
          this.provider.currentChainId = chainId;
          this.eventHandlers?.chainChanged?.(chainId);
        }

        if (data?.method === 'metamask_accountsChanged') {
          const accounts = data?.params;
          console.log('metamask_accountsChanged', { accounts });
          this.currentAccount = accounts[0];
          this.eventHandlers?.accountsChanged?.(accounts);
        }
      }
    });

    console.log('MetamaskConnectEVM constructor finished');
  }

  async connect({ chainId, account }: { chainId: number; account?: string }) {
    const caipChainId: Scope<RPCAPI>[] = chainId
      ? [`${EIP155}:${chainId}`]
      : [];

    const caipAccountId: CaipAccountId[] =
      chainId && account ? [`${EIP155}:${chainId}:${account}`] : [];

    console.log('caipChainId', caipChainId);
    console.log('caipAccountId', caipAccountId);

    await this.core.connect(caipChainId, caipAccountId);

    this.currentChainId = chainId;

    const result = {
      accounts: [await this.getAccount()],
      chainId: this.currentChainId,
    };

    this.provider.emit('connect', result);

    return result;
  }

  async disconnect() {
    await this.core.disconnect();

    this.provider.emit('disconnect');

    this.clearConnectionState();
  }

  async terminate() {
    this.disconnect();
  }

  async getProvider(): Promise<EIP1193Provider> {
    return this.provider;
  }

  async getChainId(): Promise<number | undefined> {
    return this.currentChainId;
  }

  async getAccount(): Promise<string | undefined> {
    return this.currentAccount;
  }

  switchChain({ chainId }: { chainId: number }) {
    this.currentChainId = chainId;
    this.provider.currentChainId = chainId;
    this.provider.emit('chainChanged', { chainId });
  }

  private clearConnectionState() {
    this.accounts = [];
    this.currentAccount = undefined;
    this.currentChainId = undefined;
  }
}

export async function createEVMLayer(
  options: MultichainOptions & {
    eventEmitter?: MinimalEventEmitter;
    eventHandlers?: EventHandlers;
  },
) {
  try {
    const core = await createMetamaskSDK(options);
    return new MetamaskConnectEVM({
      core,
      eventEmitter: options.eventEmitter,
      eventHandlers: options.eventHandlers,
    });
  } catch (error) {
    console.error('Error creating core', error);
    throw error;
  }
}
