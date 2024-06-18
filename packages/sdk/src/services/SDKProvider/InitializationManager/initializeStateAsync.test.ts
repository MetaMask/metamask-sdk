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
      providerStateRequested: false,
      request: mockRequest,
      _initializeState: mockInitializeState,
      _log: { error: mockLogError },
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

  // FIXME - test case is incomplete - need redo after protocol v2
});
