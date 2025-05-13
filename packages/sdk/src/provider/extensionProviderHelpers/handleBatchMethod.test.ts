import { MetaMaskInpageProvider } from '@metamask/providers';
import { TrackingEvents } from '@metamask/sdk-communication-layer';
import { analytics } from '@metamask/sdk-analytics';
import { MetaMaskSDK } from '../../sdk';
import { handleBatchMethod } from './handleBatchMethod';

// Mock the analytics module
jest.mock('@metamask/sdk-analytics', () => ({
  analytics: {
    track: jest.fn(),
  },
}));

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
  let analyticsTrackMock: jest.Mock;

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

    // the provider is always the target
    // in wrapExtensionProvider
    mockTarget = mockProvider;
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
    const args = { method: 'metamask_batch', params };

    await handleBatchMethod({
      target: mockTarget,
      args,
      trackEvent: false,
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

    expect(mockProvider.request).toHaveReturnedTimes(2);
  });

  it('should returns the response from the target request method', async () => {
    const params = [
      { method: 'rpc1', params: [] },
      { method: 'rpc2', params: [] },
    ];
    const args = { method: 'metamask_batch', params };
    const mockResponse = 'mockResponse';
    (mockTarget.request as jest.Mock).mockResolvedValue(mockResponse);

    const response = await handleBatchMethod({
      target: mockTarget,
      args,
      trackEvent: false,
      sdkInstance,
    });

    // 2 RPCs mean 2 return values
    expect(response).toStrictEqual([mockResponse, mockResponse]);
  });

  it('should sends tracking event if trackEvent is true', async () => {
    const params = [
      { method: 'rpc1', params: [] },
      { method: 'rpc2', params: [] },
    ];
    const args = { method: 'metamask_batch', params };

    await handleBatchMethod({
      target: mockTarget,
      args,
      trackEvent: true,
      sdkInstance,
    });

    expect(spyAnalytics).toHaveBeenCalledWith({
      event: TrackingEvents.SDK_RPC_REQUEST_DONE,
      params: {
        method: 'metamask_batch',
        from: 'N/A',
        id: expect.any(String),
      },
    });
  });

  it('should does not send tracking event if trackEvent is false', async () => {
    const params = [
      { method: 'rpc1', params: [] },
      { method: 'rpc2', params: [] },
    ];
    const args = { method: 'metamask_batch', params };

    await handleBatchMethod({
      target: mockTarget,
      args,
      trackEvent: false,
      sdkInstance,
    });

    expect(spyAnalytics).not.toHaveBeenCalled();
  });

  it('should track successful RPC requests in batch with analytics', async () => {
    const params = [
      { method: 'rpc1', params: [] },
      { method: 'rpc2', params: [] },
    ];
    const args = { method: 'metamask_batch', params };
    (mockTarget.request as jest.Mock).mockResolvedValue('success');

    await handleBatchMethod({
      target: mockTarget,
      args,
      trackEvent: true,
      sdkInstance,
    });

    expect(analyticsTrackMock).toHaveBeenCalledWith('sdk_action_succeeded', {
      action: args.method,
    });
    expect(analyticsTrackMock).toHaveBeenCalledTimes(2); // Called for each response
  });

  it('should track user rejected RPC requests (code 4001) in batch with analytics', async () => {
    const params = [
      { method: 'rpc1', params: [] },
      { method: 'rpc2', params: [] },
    ];
    const args = { method: 'metamask_batch', params };
    const errorResponse = {
      error: {
        code: 4001,
        message: 'User rejected the request',
      },
    };
    (mockTarget.request as jest.Mock).mockResolvedValue(errorResponse);

    await handleBatchMethod({
      target: mockTarget,
      args,
      trackEvent: true,
      sdkInstance,
    });

    expect(analyticsTrackMock).toHaveBeenCalledWith('sdk_action_rejected', {
      action: args.method,
    });
    expect(analyticsTrackMock).toHaveBeenCalledTimes(2); // Called for each response
  });

  it('should track failed RPC requests in batch with analytics', async () => {
    const params = [
      { method: 'rpc1', params: [] },
      { method: 'rpc2', params: [] },
    ];
    const args = { method: 'metamask_batch', params };
    const errorResponse = {
      error: {
        code: 4000,
        message: 'General error occurred',
      },
    };
    (mockTarget.request as jest.Mock).mockResolvedValue(errorResponse);

    await handleBatchMethod({
      target: mockTarget,
      args,
      trackEvent: true,
      sdkInstance,
    });

    expect(analyticsTrackMock).toHaveBeenCalledWith('sdk_action_failed', {
      action: args.method,
    });
    expect(analyticsTrackMock).toHaveBeenCalledTimes(2); // Called for each response
  });

  it('should track mixed success and failure responses in batch', async () => {
    const params = [
      { method: 'rpc1', params: [] },
      { method: 'rpc2', params: [] },
    ];
    const args = { method: 'metamask_batch', params };
    const successResponse = 'success';
    const errorResponse = {
      error: {
        code: 4001,
        message: 'User rejected the request',
      },
    };

    // First call succeeds, second one gets rejected
    (mockTarget.request as jest.Mock)
      .mockResolvedValueOnce(successResponse)
      .mockResolvedValueOnce(errorResponse);

    await handleBatchMethod({
      target: mockTarget,
      args,
      trackEvent: true,
      sdkInstance,
    });

    // Check that both analytics events were called
    expect(analyticsTrackMock).toHaveBeenCalledWith('sdk_action_succeeded', {
      action: args.method,
    });
    expect(analyticsTrackMock).toHaveBeenCalledWith('sdk_action_rejected', {
      action: args.method,
    });
    expect(analyticsTrackMock).toHaveBeenCalledTimes(2);
  });
});
