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
  connect: (result: { accounts: string[]; chainId: number }) => void;
  disconnect: () => void;
};

type MetamaskConnectEVMOptions = {
  core: MultichainCore;
  eventEmitter?: MinimalEventEmitter;
  eventHandlers?: EventHandlers;
};

type AddEthereumChainParameter = {
  chainId?: string;
  chainName?: string;
  nativeCurrency?: {
    name?: string;
    symbol?: string;
    decimals?: number;
  };
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[];
};

function toHex(value: number | string): string {
  return `0x${value.toString(16)}`;
}

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

  /** The session scopes currently permitted */
  private sessionScopes: SessionData['sessionScopes'] = {};

  /** Optional event handlers for the EIP-1193 provider events. */
  private eventHandlers?: EventHandlers;

  /** The latest chain configuration received from a switchEthereumChain request */
  private latestChainConfiguration?: AddEthereumChainParameter;

  /** The handler for the metamask-provider events */
  private metamaskProviderHandler: (event: MessageEvent) => void;

  /** The handler for the wallet_sessionChanged event */
  private sessionChangedHandler: (session: SessionData) => void;

  constructor({ core, eventHandlers }: MetamaskConnectEVMOptions) {
    console.log('MetamaskConnectEVM constructor starts');
    this.core = core;
    this.provider = new EIP1193Provider(core);
    this.eventHandlers = eventHandlers;

    // Setup the event listeners for the wallet's EIP-1193 events
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.metamaskProviderHandler = (event: MessageEvent) => {
      if (
        event?.data?.data?.name === 'metamask-provider' &&
        event.origin === location.origin
      ) {
        const data = event?.data?.data?.data;

        console.log('message', data);
        if (data?.method === 'metamask_accountsChanged') {
          const accounts = data?.params;
          console.log('metamask_accountsChanged', { accounts });
          this.currentAccount = accounts[0];
          this.eventHandlers?.accountsChanged?.(accounts);
        }

        if (data?.method === 'metamask_chainChanged') {
          const chainId = Number(data?.params.chainId);
          console.log('metamask_chainChanged', { chainId });
          this.currentChainId = chainId;

          // TODO: (@wenfix): better setter
          this.provider.currentChainId = chainId;
          this.provider.emit('chainChanged', { chainId });
          this.eventHandlers?.chainChanged?.(chainId.toString());

          // If the chainId is the same as the latest chain configuration,
          // we managed to set the chain correctly and can clear the configuration.
          if (this.latestChainConfiguration?.chainId === chainId.toString()) {
            this.latestChainConfiguration = null;
          }
        }

        if (data?.error?.code === 4902) {
          console.log('metamask_switchEthereumChain error', data?.error);

          this.addEthereumChain({ chainId: this.currentChainId });
        }
      }
    };

    this.sessionChangedHandler = (session: SessionData) => {
      console.log('sessionChanged', session);
      this.sessionScopes = session?.sessionScopes ?? {};

      console.log('sessionScopes', this.sessionScopes);
      const ethAccounts = getEthAccounts(this.sessionScopes);
      this.currentAccount = ethAccounts[0];
      this.accounts = ethAccounts;
    };

    window.addEventListener('message', this.metamaskProviderHandler);

    this.core.on('wallet_sessionChanged', this.sessionChangedHandler);
  }

  async connect({ chainId, account }: { chainId: number; account?: string }) {
    const caipChainId: Scope<RPCAPI>[] = chainId
      ? [`${EIP155}:${chainId}`]
      : [];

    const caipAccountId: CaipAccountId[] =
      chainId && account ? [`${EIP155}:${chainId}:${account}`] : [];

    await this.core.connect(caipChainId, caipAccountId);

    this.currentChainId = chainId;

    const result = {
      accounts: [await this.getAccount()],
      chainId: this.currentChainId,
    };

    this.provider.emit('connect', result);
    this.eventHandlers?.accountsChanged?.(result.accounts);

    return result;
  }

  async disconnect() {
    await this.core.disconnect();

    this.provider.emit('disconnect');
    this.eventHandlers?.accountsChanged?.([undefined]);
    this.eventHandlers?.disconnect?.();

    this.clearConnectionState();

    if (this.metamaskProviderHandler) {
      window.removeEventListener('message', this.metamaskProviderHandler);
    }

    if (this.sessionChangedHandler) {
      this.core.off('wallet_sessionChanged', this.sessionChangedHandler);
    }
  }

  // Legacy method for backward compatibility
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

  /**
   * Switches the Ethereum chain. Will track state internally whenever possible.
   *
   * @param chainId - The chain ID to switch to
   * @param chainConfiguration - The chain configuration to use in case the chain is not present by the wallet
   */
  switchChain({
    chainId,
    chainConfiguration,
  }: {
    chainId: number;
    chainConfiguration?: AddEthereumChainParameter;
  }) {
    if (this.currentChainId === chainId) {
      return;
    }

    // TODO: Check if approved scopes have the chain and early return

    // Save the chain configuration in case it's not present in the wallet
    this.latestChainConfiguration = chainConfiguration;

    const hexChainId = toHex(chainId);

    this.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    });
  }

  /**
   * Clears the internal connection state: accounts and chainId
   */
  private clearConnectionState() {
    this.accounts = [];
    this.currentAccount = undefined;
    this.currentChainId = undefined;
  }

  /**
   * Switches the Ethereum chain
   * @param chainId - The chain ID to switch to
   */
  private async switchEthereumChain({ chainId }: { chainId: number }) {
    const hexChainId = toHex(chainId);

    await this.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    });
  }

  /**
   * Adds an Ethereum chain using the latest chain configuration received from
   * a switchEthereumChain request
   */
  private async addEthereumChain() {
    if (!this.latestChainConfiguration) {
      throw new Error('No chain configuration found.');
    }

    await this.request({
      method: 'wallet_addEthereumChain',
      params: [this.latestChainConfiguration],
    });
  }

  /**
   * Submits a request to the EIP-1193 provider
   * @param request - The request object containing the method and params
   */
  private async request(request: { method: string; params: unknown[] }) {
    await window.postMessage(
      {
        target: 'metamask-contentscript',
        data: {
          name: 'metamask-provider',
          data: request,
        },
      },
      location.origin,
    );
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
