import {
  createMetamaskSDK,
  MultichainOptions,
  MultichainCore,
  Scope,
  RPCAPI,
  SessionData,
} from '@metamask/multichain-sdk';
import { EIP1193Provider } from './provider';
import { getEthAccounts } from './utils/get-eth-accounts';

type CaipAccountId = `${string}:${string}:${string}`;

type MinimalEventEmitter = Pick<EIP1193Provider, 'on' | 'off' | 'emit'>;

type MetamaskConnectEVMOptions = {
  core: MultichainCore;
  eventEmitter?: MinimalEventEmitter;
};

type Hex = `0x${string}`;

export class MetamaskConnectEVM {
  private core: MultichainCore;

  currentChainId?: number;

  currentAccount?: string;

  private provider: EIP1193Provider;

  private eventEmitter: MinimalEventEmitter;

  private sessionScopes: SessionData['sessionScopes'] = {};

  constructor({ core, eventEmitter }: MetamaskConnectEVMOptions) {
    console.log('MetamaskConnectEVM constructor starts');
    this.core = core;
    this.provider = new EIP1193Provider(core);
    this.eventEmitter = eventEmitter ?? this.provider;

    this.core.on('wallet_sessionChanged', (session) => {
      console.log('wallet_sessionChanged', session);
      this.sessionScopes = session?.sessionScopes ?? {};
      const ethAccounts = getEthAccounts(this.sessionScopes);

      this.currentAccount = ethAccounts[0];

      if (!session) {
        this.eventEmitter?.emit('disconnect');
      }
    });

    // @ts-expect-error - type mismatch
    if (window.ethereum?.isMetaMask) {
      // @ts-expect-error - type mismatch
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        console.log('accountsChanged', accounts);
        this.currentAccount = accounts[0];
      });

      // @ts-expect-error - type mismatch
      window.ethereum.on('chainChanged', (chainId: Hex) => {
        console.log('chainChanged', chainId);
        this.currentChainId = Number(chainId);
      });
    }

    console.log('MetamaskConnectEVM constructor finished');
  }

  async connect({
    chainId = 1,
    account,
  }: {
    chainId: number;
    account: string;
  }) {
    const caipChainId: Scope<RPCAPI>[] = chainId ? [`eip155:${chainId}`] : [];
    const caipAccountId: CaipAccountId[] = account
      ? [`eip155:${chainId}:${account}`]
      : [];

    console.log('caipChainId', caipChainId);
    console.log('caipAccountId', caipAccountId);
    await this.core.connect(caipChainId, caipAccountId);

    this.currentChainId = chainId;

    const result = {
      accounts: [await this.getAccount()],
      chainId: this.currentChainId,
    };

    return result;
  }

  async disconnect() {
    console.log('disconnect starts');
    const disconnected = await this.core.disconnect();
    console.log('disconnected', disconnected);
    console.log('disconnect ends');
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
}

export async function createEVMLayer(
  options: MultichainOptions & { eventEmitter?: MinimalEventEmitter },
) {
  try {
    const core = await createMetamaskSDK(options);
    return new MetamaskConnectEVM({ core, eventEmitter: options.eventEmitter });
  } catch (error) {
    console.error('Error creating core', error);
    throw error;
  }
}
