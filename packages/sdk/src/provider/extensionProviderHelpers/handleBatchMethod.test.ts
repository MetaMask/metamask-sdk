import { MetaMaskInpageProvider } from '@metamask/providers';
import { TrackingEvents } from '@metamask/sdk-communication-layer';
import { MetaMaskSDK } from '../../sdk';
import { handleBatchMethod } from './handleBatchMethod';

jest.mock('@metamask/providers', () => {
  return {
    MetaMaskInpageProvider: jest.fn(() => {
      return {
        // Mock implementation here
        request: jest.fn(),
      };
    }),
  };
});

describe('handleBatchMethod', () => {
  let sdkInstance: MetaMaskSDK;
  let mockProvider: MetaMaskInpageProvider;
  let mockTarget: MetaMaskInpageProvider;
  const spyAnalytics = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

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

    mockTarget = {
      request: jest.fn(),
    } as unknown as MetaMaskInpageProvider;
  });

  afterEach(() => {
    // Clean up after each test
    jest.restoreAllMocks();
  });

  it('should calls the provider request method for each RPC in params', async () => {
    const params = [
      { method: 'rpc1', params: [] },
      { method: 'rpc2', params: [] },
    ];
    const args = { method: 'someMethod', params: ['param1'] };

    await handleBatchMethod({
      params,
      target: mockTarget,
      args,
      trackEvent: false,
      provider: mockProvider,
      sdkInstance,
    });

    expect(mockProvider.request).toHaveBeenCalledWith({
      method: 'rpc1',
      params: [],
    });

    expect(mockProvider.request).toHaveBeenCalledWith({
      method: 'rpc2',
      params: [],
    });
  });

  it('should returns the response from the target request method', async () => {
    const params: any[] = [];
    const args = { method: 'someMethod', params: ['param1'] };
    const mockResponse = 'mockResponse';
    (mockTarget.request as jest.Mock).mockResolvedValue(mockResponse);

    const response = await handleBatchMethod({
      params,
      target: mockTarget,
      args,
      trackEvent: false,
      provider: mockProvider,
      sdkInstance,
    });

    expect(response).toBe(mockResponse);
  });

  it('should sends tracking event if trackEvent is true', async () => {
    const params: any[] = [];
    const args = { method: 'someMethod', params: ['param1'] };

    await handleBatchMethod({
      params,
      target: mockTarget,
      args,
      trackEvent: true,
      provider: mockProvider,
      sdkInstance,
    });

    expect(spyAnalytics).toHaveBeenCalledWith({
      event: TrackingEvents.SDK_RPC_REQUEST_DONE,
      params: {
        method: 'someMethod',
        from: 'extension',
        id: expect.any(String),
      },
    });
  });

  it('should does not send tracking event if trackEvent is false', async () => {
    const params: any[] = [];
    const args = { method: 'someMethod', params: ['param1'] };

    await handleBatchMethod({
      params,
      target: mockTarget,
      args,
      trackEvent: false,
      provider: mockProvider,
      sdkInstance,
    });

    expect(spyAnalytics).not.toHaveBeenCalled();
  });
});
