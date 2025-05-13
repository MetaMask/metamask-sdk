import { MetaMaskInpageProvider } from '@metamask/providers';
import { TrackingEvents } from '@metamask/sdk-communication-layer';
import { analytics } from '@metamask/sdk-analytics';
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

// Mock analytics module
jest.mock('@metamask/sdk-analytics', () => ({
  analytics: {
    track: jest.fn(),
  },
}));

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
  let analyticsTrackMock: jest.Mock;

  // Mocking localStorage
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset the mocked analytics track function
    analyticsTrackMock = analytics.track as jest.Mock;
    analyticsTrackMock.mockClear();

    // Mocking localStorage for Node.js environment
    let store: { [key: string]: string } = {};

    global.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      length: 0,
      key: (index: number) => Object.keys(store)[index] || null,
    };

    sdkInstance = {
      analytics: {
        send: spyAnalytics,
      },
    } as unknown as MetaMaskSDK;

    mockProvider = {
      request: jest.fn(),
    } as unknown as MetaMaskInpageProvider;
  });

  afterEach(() => {
    // Clean up after each test
    jest.restoreAllMocks();
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
      params: {
        method: args.method,
        from: 'N/A',
        id: expect.any(String),
      },
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
      target: mockProvider,
      args,
      trackEvent: true,
      sdkInstance,
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
      params: {
        method: args.method,
        from: 'N/A',
        id: expect.any(String),
      },
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

  it('should track successful RPC request with analytics', async () => {
    const wrapped = wrapExtensionProvider({
      provider: mockProvider,
      sdkInstance,
    });
    const args: RequestArguments = {
      method: lcAnalyticsRPCs[0],
      params: ['param1'],
    };
    (mockProvider.request as jest.Mock).mockResolvedValue('success');

    await wrapped.request(args);

    expect(analyticsTrackMock).toHaveBeenCalledWith('sdk_action_succeeded', {
      action: args.method,
    });
  });

  it('should track user rejected RPC request (code 4001) with analytics', async () => {
    const wrapped = wrapExtensionProvider({
      provider: mockProvider,
      sdkInstance,
    });
    const args: RequestArguments = {
      method: lcAnalyticsRPCs[0],
      params: ['param1'],
    };
    const userRejectionError = new Error('User rejected');
    // We need to cast to any to add the code property
    (userRejectionError as any).code = 4001;
    (mockProvider.request as jest.Mock).mockRejectedValue(userRejectionError);

    await expect(wrapped.request(args)).rejects.toThrow('User rejected');

    expect(analyticsTrackMock).toHaveBeenCalledWith('sdk_action_rejected', {
      action: args.method,
    });
  });

  it('should track failed RPC request (non-4001 error) with analytics', async () => {
    const wrapped = wrapExtensionProvider({
      provider: mockProvider,
      sdkInstance,
    });
    const args: RequestArguments = {
      method: lcAnalyticsRPCs[0],
      params: ['param1'],
    };
    const generalError = new Error('General error');
    // We need to cast to any to add the code property
    (generalError as any).code = 4000;
    (mockProvider.request as jest.Mock).mockRejectedValue(generalError);

    await expect(wrapped.request(args)).rejects.toThrow('General error');

    expect(analyticsTrackMock).toHaveBeenCalledWith('sdk_action_failed', {
      action: args.method,
    });
  });

  it('should track when RPC response contains an error object with code 4001', async () => {
    const wrapped = wrapExtensionProvider({
      provider: mockProvider,
      sdkInstance,
    });
    const args: RequestArguments = {
      method: lcAnalyticsRPCs[0],
      params: ['param1'],
    };
    const errorResponse = {
      error: {
        code: 4001,
        message: 'User rejected the request',
      },
    };
    (mockProvider.request as jest.Mock).mockResolvedValue(errorResponse);

    await wrapped.request(args);

    expect(analyticsTrackMock).toHaveBeenCalledWith('sdk_action_rejected', {
      action: args.method,
    });
  });

  it('should track when RPC response contains a general error object', async () => {
    const wrapped = wrapExtensionProvider({
      provider: mockProvider,
      sdkInstance,
    });
    const args: RequestArguments = {
      method: lcAnalyticsRPCs[0],
      params: ['param1'],
    };
    const errorResponse = {
      error: {
        code: 4000,
        message: 'General error occurred',
      },
    };
    (mockProvider.request as jest.Mock).mockResolvedValue(errorResponse);

    await wrapped.request(args);

    expect(analyticsTrackMock).toHaveBeenCalledWith('sdk_action_failed', {
      action: args.method,
    });
  });
});
