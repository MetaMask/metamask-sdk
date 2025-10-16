import {
  createMetamaskSDK,
  MultichainOptions,
  MultichainCore,
  Scope,
  RPCAPI,
} from '@metamask/multichain-sdk';
import { EIP1193Provider } from './provider';

type CaipAccountId = `${string}:${string}:${string}`;

type MinimalEventEmitter = Pick<EIP1193Provider, 'on' | 'off' | 'emit'>;

type MetamaskConnectEVMOptions = {
  core: MultichainCore;
  eventEmitter?: MinimalEventEmitter;
};

export class MetamaskConnectEVM {
  private core: MultichainCore;

  currentChainId?: number;

  currentAccount?: string;

  private provider: EIP1193Provider;

  private eventEmitter: EIP1193Provider;

  constructor({ core, eventEmitter }: MetamaskConnectEVMOptions) {
    console.log('MetamaskConnectEVM constructor starts');
    this.core = core;
    this.provider = new EIP1193Provider(core);
    this.eventEmitter = this.provider;

    // // Setup listeners
    // this.eventEmitter.on('connect', (data) => {
    //   console.log('connect', data);
    //   this.currentChainId = data.chainId;
    // });

    // this.eventEmitter.on('disconnect', () => {
    //   this.currentChainId = undefined;
    //   console.log('disconnect');
    // });

    // this.eventEmitter.on('accountsChanged', (data) => {
    //   this.currentAccount = data.account;
    //   console.log('accountsChanged', data);
    // });

    // this.eventEmitter.on('chainChanged', (data) => {
    //   this.currentChainId = data.chainId;
    //   console.log('chainChanged', data);
    // });
    console.log('MetamaskConnectEVM constructor runs');
  }

  async connect({ chainId, account }: { chainId: number; account: string }) {
    const caipChainId: Scope<RPCAPI>[] = chainId ? [`eip155:${chainId}`] : [];
    const caipAccountId: CaipAccountId[] = account
      ? [`eip155:${chainId}:${account}`]
      : [];

    console.log('caipChainId', caipChainId);
    console.log('caipAccountId', caipAccountId);
    const session = await this.core.connect(caipChainId, caipAccountId);
    // @ts-expect-error - type mismatch
    if (session) {
      this.currentChainId = chainId;
      this.provider.emit('connect', { chainId });
    }
  }

  async disconnect() {
    console.log('disconnect starts');
    //await this.core.provider.revokeSession({});
    this.core.disconnect();
    console.log('disconnect ends');
  }

  async terminate() {
    this.disconnect();
  }

  async getProvider(): Promise<EIP1193Provider> {
    return this.provider;
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
