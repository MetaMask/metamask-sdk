import { createMetamaskSDK } from '@metamask/multichain-sdk';
import { MetamaskConnectEVM, createEVMLayer } from '../layer';

// Minimal MultichainCore-like object; methods rely on `this` so that when
// bound in EIP1193Provider, they operate on the provider instance.
function createFakeCore() {
  const listeners: Record<string, ((...a: unknown[]) => void)[]> = {};
  return {
    provider: {
      revokeSession: (_opts: unknown) => undefined,
    },
    // EventEmitter-like API used by EIP1193Provider
    emit(event: string, ...args: unknown[]) {
      (listeners[event] ?? []).forEach((fn) => fn(...args));
    },
    on(event: string, handler: (...args: unknown[]) => void) {
      listeners[event] = listeners[event] ?? [];
      listeners[event].push(handler);
      return () => {
        const list = listeners[event] ?? [];
        listeners[event] = list.filter((h) => h !== handler);
      };
    },
    off(event: string, handler: (...args: unknown[]) => void) {
      const list = listeners[event] ?? [];
      listeners[event] = list.filter((h) => h !== handler);
    },
    connect(): Promise<void> {
      return Promise.resolve();
    },
    disconnect(): Promise<void> {
      return Promise.resolve();
    },
    invokeMethod(): Promise<unknown> {
      return Promise.resolve(undefined);
    },
  } as const;
}

jest.mock('@metamask/multichain-sdk', () => {
  const mockCreate = jest.fn(async () => createFakeCore());
  function MultichainCore(this: unknown, _options: unknown) {
    Object.assign(this as any, createFakeCore());
  }
  return {
    createMetamaskSDK: mockCreate,
    MultichainCore,
  };
});

describe('MetamaskConnectEVM initialization', () => {
  it('constructor creates provider and sets up listeners', () => {
    const core = createFakeCore();
    const instance = new MetamaskConnectEVM({ core: core as unknown as any });
    expect(instance).toBeInstanceOf(MetamaskConnectEVM);
  });
});

describe('createEVMLayer', () => {
  it('returns an initialized MetamaskConnectEVM instance', async () => {
    const instance = await createEVMLayer({
      // minimal options per MultichainOptions type
      dapp: { name: 'test' },
      storage: {} as any,
      ui: { factory: {} as any },
    } as any);

    expect(instance).toBeInstanceOf(MetamaskConnectEVM);
    expect(createMetamaskSDK).toHaveBeenCalled();
  });
});
