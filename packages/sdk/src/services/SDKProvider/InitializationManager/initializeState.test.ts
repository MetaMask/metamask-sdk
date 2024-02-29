/* eslint-disable @typescript-eslint/ban-ts-comment */
import { SDKProvider } from '../../../provider/SDKProvider';
import * as loggerModule from '../../../utils/logger';
import { initializeState } from './initializeState';

describe('initializeState', () => {
  let mockSDKProvider: SDKProvider;
  const mockSuperInitializeState: jest.Mock = jest.fn();
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  beforeEach(() => {
    jest.clearAllMocks();

    mockSDKProvider = {
      state: {
        debug: false,
      },
      _state: {
        initialized: true,
      },
    } as unknown as SDKProvider;
  });

  it('should log debug information when debug is true', () => {
    jest.spyOn(console, 'debug').mockImplementation();
    initializeState(mockSDKProvider, mockSuperInitializeState);

    expect(spyLogger).toHaveBeenCalledWith(
      '[SDKProvider: initializeState()] set state._initialized to false',
    );
  });

  it('should set instance._state.initialized to false', () => {
    initializeState(mockSDKProvider, mockSuperInitializeState);

    // @ts-ignore
    expect(mockSDKProvider._state.initialized).toBe(false);
  });

  it('should call superInitializeState with the passed initialState', () => {
    const someInitialState = {
      accounts: ['someAccount'],
      chainId: 'someChainId',
      isUnlocked: true,
    };

    initializeState(
      mockSDKProvider,
      mockSuperInitializeState,
      someInitialState,
    );

    expect(mockSuperInitializeState).toHaveBeenCalledWith(someInitialState);
  });
});
