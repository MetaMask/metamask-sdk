import { renderHook } from '@testing-library/react-hooks';
import { useHandleChainChangedEvent } from './useHandleChainChangedEvent';

describe('useHandleChainChangedEvent', () => {
  let setChainId: jest.Mock;
  let setConnected: jest.Mock;
  let setError: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    setChainId = jest.fn();
    setConnected = jest.fn();
    setError = jest.fn();

    console.debug = jest.fn();
  });

  it('should handle chain changed event correctly with debug enabled', () => {
    const debug = true;
    const mockNetworkVersion = {
      chainId: '0x1',
      networkVersion: '1',
    };

    const { result } = renderHook(() =>
      useHandleChainChangedEvent(debug, setChainId, setConnected, setError),
    );
    result.current(mockNetworkVersion);

    expect(console.debug).toHaveBeenCalledWith(
      "MetaMaskProvider::provider on 'chainChanged' event.",
      mockNetworkVersion,
    );
    expect(setChainId).toHaveBeenCalledWith(mockNetworkVersion.chainId);
    expect(setConnected).toHaveBeenCalledWith(true);
    expect(setError).toHaveBeenCalledWith(undefined);
  });

  it('should handle chain changed event without debug logs', () => {
    const debug = false;
    const mockNetworkVersion = {
      chainId: '0x1',
      networkVersion: '1',
    };

    const { result } = renderHook(() =>
      useHandleChainChangedEvent(debug, setChainId, setConnected, setError),
    );
    result.current(mockNetworkVersion);

    expect(console.debug).not.toHaveBeenCalled();
    expect(setChainId).toHaveBeenCalledWith(mockNetworkVersion.chainId);
    expect(setConnected).toHaveBeenCalledWith(true);
    expect(setError).toHaveBeenCalledWith(undefined);
  });
});
