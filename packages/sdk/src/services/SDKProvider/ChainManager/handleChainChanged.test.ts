/* eslint-disable @typescript-eslint/ban-ts-comment */
import { SDKProvider } from '../../../provider/SDKProvider';
import { handleChainChanged } from './handleChainChanged';

describe('handleChainChanged', () => {
  let mockSDKProvider: SDKProvider;
  const superHandleChainChanged: jest.Mock = jest.fn();
  const mockEmit: jest.Mock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockSDKProvider = {
      state: {
        debug: false,
      },
      _state: { isConnected: false },
      emit: mockEmit,
    } as unknown as SDKProvider;
  });

  it('should log debug information when debug is true', () => {
    jest.spyOn(console, 'debug').mockImplementation();
    handleChainChanged({
      instance: mockSDKProvider,
      chainId: '1',
      superHandleChainChanged,
    });
    expect(console.debug).not.toHaveBeenCalled();

    mockSDKProvider.state.debug = true;
    handleChainChanged({
      instance: mockSDKProvider,
      chainId: '1',
      superHandleChainChanged,
    });

    expect(console.debug).toHaveBeenCalledWith(
      'SDKProvider::_handleChainChanged chainId=1 networkVersion=undefined',
    );
  });

  it('should handle missing networkVersion', () => {
    handleChainChanged({
      instance: mockSDKProvider,
      chainId: '1',
      superHandleChainChanged,
    });

    expect(superHandleChainChanged).toHaveBeenCalledWith({
      chainId: '1',
      networkVersion: '1',
    });
  });

  it('should update instance._state.isConnected', () => {
    handleChainChanged({
      instance: mockSDKProvider,
      chainId: '1',
      superHandleChainChanged,
    });

    // @ts-ignore
    expect(mockSDKProvider._state.isConnected).toBe(true);
  });

  it('should emit a connect event with the correct chainId', () => {
    handleChainChanged({
      instance: mockSDKProvider,
      chainId: '1',
      superHandleChainChanged,
    });

    expect(mockEmit).toHaveBeenCalledWith('connect', { chainId: '1' });
  });

  it('should call superHandleChainChanged with correct arguments', () => {
    handleChainChanged({
      instance: mockSDKProvider,
      chainId: '1',
      networkVersion: '1',
      superHandleChainChanged,
    });

    expect(superHandleChainChanged).toHaveBeenCalledWith({
      chainId: '1',
      networkVersion: '1',
    });
  });
});
