/* eslint-disable @typescript-eslint/ban-ts-comment */
import { SDKProvider } from '../../../provider/SDKProvider';
import * as loggerModule from '../../../utils/logger';
import { initializeStateAsync } from './initializeStateAsync';

describe('initializeStateAsync', () => {
  let mockSDKProvider: SDKProvider;
  const mockRequest: jest.Mock = jest.fn();
  const mockLogError: jest.Mock = jest.fn();
  const mockInitializeState: jest.Mock = jest.fn();
  const mockGetSelectedAddress = jest.fn();
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  beforeEach(() => {
    jest.clearAllMocks();

    mockSDKProvider = {
      getSelectedAddress: mockGetSelectedAddress,
      state: {},
      providerStateRequested: false,
      request: mockRequest,
      _initializeState: mockInitializeState,
      _log: { error: mockLogError },
    } as unknown as SDKProvider;
  });

  it('should log debug information', async () => {
    await initializeStateAsync(mockSDKProvider as SDKProvider);

    expect(spyLogger).toHaveBeenCalledWith(
      `[SDKProvider: initializeStateAsync()] initialize state async started`,
    );

    expect(spyLogger).toHaveBeenCalledWith(
      '[SDKProvider: initializeStateAsync()] state selectedAddress=undefined ',
      undefined,
    );
  });

  it('should skip initialization if providerStateRequested is true', async () => {
    mockSDKProvider.state.providerStateRequested = true;

    await initializeStateAsync(mockSDKProvider as SDKProvider);

    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('should handle errors during request', async () => {
    mockRequest.mockRejectedValue(new Error('Some error'));

    await initializeStateAsync(mockSDKProvider as SDKProvider);

    // @ts-ignore
    expect(mockSDKProvider._log.error).toHaveBeenCalledWith(
      'MetaMask: Failed to get initial state. Please report this bug.',
      expect.any(Error),
    );
    expect(mockSDKProvider.state.providerStateRequested).toBe(false);
  });

  it('should call _initializeState with the correct initialState', async () => {
    const mockInitialState = {
      accounts: ['someAccount'],
    };

    mockRequest.mockResolvedValue(mockInitialState);

    await initializeStateAsync(mockSDKProvider as SDKProvider);

    // @ts-ignore
    expect(mockSDKProvider._initializeState).toHaveBeenCalledWith(
      mockInitialState,
    );
  });

  it('should fetch accounts remotely when initialState does not contain accounts', async () => {
    const mockInitialState = { accounts: [] };
    mockRequest
      .mockResolvedValueOnce(mockInitialState)
      .mockResolvedValueOnce(['remoteAccount']);

    await initializeStateAsync(mockSDKProvider as SDKProvider);

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'eth_requestAccounts',
      params: [],
    });

    // @ts-ignore
    expect(mockSDKProvider._initializeState).toHaveBeenCalledWith({
      accounts: ['remoteAccount'],
    });
  });

  it('should use instance.selectedAddress when initialState does not contain accounts', async () => {
    const mockInitialState = { accounts: [] };

    mockGetSelectedAddress.mockImplementation(() => 'selectedAddress');

    mockRequest.mockResolvedValue(mockInitialState);

    await initializeStateAsync(mockSDKProvider as SDKProvider);

    // @ts-ignore
    expect(mockSDKProvider._initializeState).toHaveBeenCalledWith({
      accounts: ['selectedAddress'],
    });
  });

  it('should set providerStateRequested back to false after successful initialization', async () => {
    const mockInitialState = { accounts: ['someAccount'] };
    mockRequest.mockResolvedValue(mockInitialState);

    await initializeStateAsync(mockSDKProvider as SDKProvider);

    expect(mockSDKProvider.state.providerStateRequested).toBe(false);
  });

  it('should call _initializeState even if no accounts are found', async () => {
    const mockInitialState = { accounts: [] };
    mockRequest.mockResolvedValue(mockInitialState);

    await initializeStateAsync(mockSDKProvider as SDKProvider);

    // @ts-ignore
    expect(mockSDKProvider._initializeState).toHaveBeenCalledWith(
      mockInitialState,
    );
  });

  it('should log debug information for different scenarios', async () => {
    const mockInitialState = { accounts: [] };
    mockRequest.mockResolvedValue(mockInitialState);

    await initializeStateAsync(mockSDKProvider as SDKProvider);

    expect(spyLogger).toHaveBeenCalledWith(
      expect.stringContaining("initial state doesn't contain accounts"),
    );
  });
});
