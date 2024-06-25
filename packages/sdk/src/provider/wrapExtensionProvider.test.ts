import { MetaMaskInpageProvider } from '@metamask/providers';
import { TrackingEvents } from '@metamask/sdk-communication-layer';
import { lcAnalyticsRPCs, RPC_METHODS } from '../config';
import { MetaMaskSDK } from '../sdk';
import { logger } from '../utils/logger';
import { handleBatchMethod } from './extensionProviderHelpers/handleBatchMethod';
import { handleConnectSignMethod } from './extensionProviderHelpers/handleConnectSignMethod';
import { handleConnectWithMethod } from './extensionProviderHelpers/handleConnectWithMethod';
import {
  wrapExtensionProvider,
  RequestArguments,
} from './wrapExtensionProvider';

jest.mock('@metamask/providers', () => {
  return {
    MetaMaskInpageProvider: jest.fn(() => {
      return {
        request: jest.fn(),
      };
    }),
  };
});

jest.mock('../utils/logger', () => ({
  logger: jest.fn(),
}));

jest.mock('./extensionProviderHelpers/handleBatchMethod');
jest.mock('./extensionProviderHelpers/handleConnectSignMethod');
jest.mock('./extensionProviderHelpers/handleConnectWithMethod');

describe('wrapExtensionProvider', () => {
  let sdkInstance: MetaMaskSDK;
  let mockProvider: MetaMaskInpageProvider;
  const spyAnalytics = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    sdkInstance = {
      analytics: {
        send: spyAnalytics,
      },
    } as unknown as MetaMaskSDK;

    mockProvider = {
      request: jest.fn(),
    } as unknown as MetaMaskInpageProvider;
  });

  it('should throw an error if provider has state', () => {
    mockProvider = {
      ...mockProvider,
      state: {},
    } as unknown as MetaMaskInpageProvider;

    expect(() =>
      wrapExtensionProvider({ provider: mockProvider, sdkInstance }),
    ).toThrow('INVALID EXTENSION PROVIDER');
  });

  it('should initialize a Proxy around the provider', () => {
    const wrapped = wrapExtensionProvider({
      provider: mockProvider,
      sdkInstance,
    });
    expect(typeof wrapped).toBe('object');
  });

  it('should log the request method', async () => {
    const wrapped = wrapExtensionProvider({
      provider: mockProvider,
      sdkInstance,
    });
    const args: RequestArguments = { method: 'someMethod', params: ['param1'] };

    await wrapped.request(args);

    expect(logger).toHaveBeenCalledWith(
      `[wrapExtensionProvider()] Overwriting request method`,
      args,
    );
  });

  it('should send tracking event for tracked methods', async () => {
    const wrapped = wrapExtensionProvider({
      provider: mockProvider,
      sdkInstance,
    });
    const args: RequestArguments = {
      method: lcAnalyticsRPCs[0],
      params: ['param1'],
    };

    await wrapped.request(args);

    expect(spyAnalytics).toHaveBeenCalledWith({
      event: TrackingEvents.SDK_RPC_REQUEST,
      params: { method: args.method, from: 'extension' },
    });
  });

  it('should handle METAMASK_BATCH method', async () => {
    const wrapped = wrapExtensionProvider({
      provider: mockProvider,
      sdkInstance,
    });
    const args: RequestArguments = {
      method: RPC_METHODS.METAMASK_BATCH,
      params: [{ method: 'rpc1', params: [] }],
    };

    await wrapped.request(args);

    expect(handleBatchMethod).toHaveBeenCalledWith({
      params: args.params,
      target: mockProvider,
      args,
      trackEvent: true,
      sdkInstance,
      provider: mockProvider,
    });
  });

  it('should handle METAMASK_CONNECTSIGN method', async () => {
    const wrapped = wrapExtensionProvider({
      provider: mockProvider,
      sdkInstance,
    });
    const args: RequestArguments = {
      method: RPC_METHODS.METAMASK_CONNECTSIGN,
      params: ['message'],
    };

    await wrapped.request(args);

    expect(handleConnectSignMethod).toHaveBeenCalledWith({
      target: mockProvider,
      params: args.params,
    });
  });

  it('should handle METAMASK_CONNECTWITH method', async () => {
    const wrapped = wrapExtensionProvider({
      provider: mockProvider,
      sdkInstance,
    });
    const args: RequestArguments = {
      method: RPC_METHODS.METAMASK_CONNECTWITH,
      params: ['param1'],
    };

    await wrapped.request(args);

    expect(handleConnectWithMethod).toHaveBeenCalledWith({
      target: mockProvider,
      params: args.params,
    });
  });

  it('should call the request method directly for other methods', async () => {
    const wrapped = wrapExtensionProvider({
      provider: mockProvider,
      sdkInstance,
    });
    const args: RequestArguments = {
      method: 'someOtherMethod',
      params: ['param1'],
    };
    (mockProvider.request as jest.Mock).mockResolvedValue('response');

    const response = await wrapped.request(args);

    expect(mockProvider.request).toHaveBeenCalledWith(args);
    expect(response).toBe('response');
  });

  it('should send SDK_RPC_REQUEST_DONE event after request', async () => {
    const wrapped = wrapExtensionProvider({
      provider: mockProvider,
      sdkInstance,
    });
    const args: RequestArguments = {
      method: lcAnalyticsRPCs[0],
      params: ['param1'],
    };

    await wrapped.request(args);

    expect(spyAnalytics).toHaveBeenCalledWith({
      event: TrackingEvents.SDK_RPC_REQUEST_DONE,
      params: { method: args.method, from: 'extension' },
    });
  });

  it('should return provider properties directly', () => {
    const wrapped = wrapExtensionProvider({
      provider: mockProvider,
      sdkInstance,
    });

    expect(wrapped.request).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(wrapped.getChainId).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(wrapped.getNetworkVersion).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(wrapped.getSelectedAddress).toBeDefined();
    expect(wrapped.isConnected).toBeDefined();
  });
});
