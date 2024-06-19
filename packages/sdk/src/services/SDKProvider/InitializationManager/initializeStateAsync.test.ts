import { SDKProvider } from '../../../provider/SDKProvider';
import * as StorageManagerModule from '../../../storage-manager/getStorageManager';
import * as loggerModule from '../../../utils/logger';
import { initializeStateAsync } from './initializeStateAsync';

jest.mock('../../../utils/logger', () => ({
  logger: jest.fn(),
}));

describe('initializeStateAsync', () => {
  let mockSDKProvider: SDKProvider;
  const mockRequest = jest.fn();
  const mockLogError = jest.fn();
  const mockInitializeState = jest.fn();
  const mockGetSelectedAddress = jest.fn();
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  const spyGetStorageManager = jest.spyOn(
    StorageManagerModule,
    'getStorageManager',
  );

  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string): string | null => store[key] || null),
      setItem: jest.fn((key: string, value: string): void => {
        store[key] = value.toString();
      }),
      clear: jest.fn((): void => {
        store = {};
      }),
      removeItem: jest.fn((key: string): void => {
        delete store[key];
      }),
      key: jest.fn(
        (index: number): string | null => Object.keys(store)[index] || null,
      ),
      get length(): number {
        return Object.keys(store).length;
      },
    };
  })();

  beforeEach(() => {
    jest.clearAllMocks();
    global.localStorage = localStorageMock as unknown as Storage;

    mockSDKProvider = {
      getSelectedAddress: mockGetSelectedAddress,
      state: {},
      _state: {},
      request: mockRequest,
      _initializeState: mockInitializeState,
      _log: { error: mockLogError },
      emit: jest.fn(),
    } as unknown as SDKProvider;
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  it('should log debug information', async () => {
    await initializeStateAsync(mockSDKProvider as SDKProvider);

    expect(spyLogger).toHaveBeenCalled();
  });

  it('should skip initialization if providerStateRequested is true', async () => {
    mockSDKProvider.state.providerStateRequested = true;

    await initializeStateAsync(mockSDKProvider as SDKProvider);

    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('should fetch initial provider state', async () => {
    spyGetStorageManager.mockReturnValue({
      getPersistedChannelConfig: jest
        .fn()
        .mockResolvedValue({ relayPersistence: true }),
      getCachedChainId: jest.fn().mockResolvedValue(undefined),
      getCachedAccounts: jest.fn().mockResolvedValue([]),
    } as any);

    mockRequest.mockResolvedValue({
      accounts: [],
      chainId: '0x1',
      isUnlocked: true,
    });

    await initializeStateAsync(mockSDKProvider as SDKProvider);

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'metamask_getProviderState',
    });
    expect(mockInitializeState).toHaveBeenCalled();
  });

  it('should handle missing accounts and fetch them', async () => {
    spyGetStorageManager.mockReturnValue({
      getPersistedChannelConfig: jest
        .fn()
        .mockResolvedValue({ relayPersistence: true }),
      getCachedChainId: jest.fn().mockResolvedValue('0x1'),
      getCachedAccounts: jest.fn().mockResolvedValue([]),
    } as any);

    mockRequest.mockResolvedValue({
      accounts: [],
      chainId: '0x1',
      isUnlocked: true,
    });

    mockGetSelectedAddress.mockReturnValue('0xABC');
    await initializeStateAsync(mockSDKProvider as SDKProvider);

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'metamask_getProviderState',
    });

    expect(mockInitializeState).toHaveBeenCalledWith({
      accounts: ['0xABC'],
      chainId: '0x1',
      isUnlocked: true,
    });
  });

  it('should request accounts if not found in initial state or selected address', async () => {
    spyGetStorageManager.mockReturnValue({
      getPersistedChannelConfig: jest
        .fn()
        .mockResolvedValue({ relayPersistence: true }),
      getCachedChainId: jest.fn().mockResolvedValue('0x1'),
      getCachedAccounts: jest.fn().mockResolvedValue([]),
    } as any);

    mockRequest.mockResolvedValue({
      accounts: [],
      chainId: '0x1',
      isUnlocked: true,
    });

    mockGetSelectedAddress.mockReturnValue(null);
    mockRequest.mockResolvedValueOnce(['0xDEF']);

    await initializeStateAsync(mockSDKProvider as SDKProvider);

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'metamask_getProviderState',
    });

    expect(mockInitializeState).toHaveBeenCalledWith(['0xDEF']);
  });

  it('should handle errors gracefully', async () => {
    spyGetStorageManager.mockReturnValue({
      getPersistedChannelConfig: jest
        .fn()
        .mockResolvedValue({ relayPersistence: true }),
      getCachedChainId: jest.fn().mockResolvedValue('0x1'),
      getCachedAccounts: jest.fn().mockResolvedValue([]),
    } as any);

    mockRequest.mockRejectedValueOnce(
      new Error('Failed to fetch provider state'),
    );

    await initializeStateAsync(mockSDKProvider as SDKProvider);

    expect(mockLogError).toHaveBeenCalledWith(
      'MetaMask: Failed to get initial state. Please report this bug.',
      expect.any(Error),
    );
    expect(mockInitializeState).not.toHaveBeenCalled();
  });

  it('should use cache if relayPersistence is enabled', async () => {
    spyGetStorageManager.mockReturnValue({
      getPersistedChannelConfig: jest
        .fn()
        .mockResolvedValue({ relayPersistence: true }),
      getCachedChainId: jest.fn().mockResolvedValue('0x1'),
      getCachedAccounts: jest.fn().mockResolvedValue(['0xABC']),
    } as any);

    await initializeStateAsync(mockSDKProvider as SDKProvider);

    expect(mockInitializeState).toHaveBeenCalledWith({
      accounts: ['0xABC'],
      chainId: '0x1',
      isUnlocked: false,
    });

    expect(mockSDKProvider.emit).toHaveBeenCalledWith('connect', {
      chainId: '0x1',
    });
  });
});
