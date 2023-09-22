import { renderHook } from '@testing-library/react-hooks';
import { useHandleConnectEvent } from './useHandleConnectEvent';

describe('useHandleConnectEvent', () => {
  let setConnecting: jest.Mock;
  let setConnected: jest.Mock;
  let setChainId: jest.Mock;
  let setError: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    setConnecting = jest.fn();
    setConnected = jest.fn();
    setChainId = jest.fn();
    setError = jest.fn();

    console.debug = jest.fn();
  });

  it('should handle connect event correctly with debug enabled', () => {
    const debug = true;
    const mockConnectParam = {
      chainId: '0x2',
    };

    const { result } = renderHook(() =>
      useHandleConnectEvent(
        debug,
        setConnecting,
        setConnected,
        setChainId,
        setError,
        undefined,
      ),
    );
    result.current(mockConnectParam);

    expect(console.debug).toHaveBeenCalledWith(
      "MetaMaskProvider::provider on 'connect' event.",
      mockConnectParam,
    );
    expect(setConnecting).toHaveBeenCalledWith(false);
    expect(setConnected).toHaveBeenCalledWith(true);
    expect(setChainId).toHaveBeenCalledWith(mockConnectParam.chainId);
    expect(setError).toHaveBeenCalledWith(undefined);
  });

  it('should handle connect event without debug logs', () => {
    const debug = false;
    const mockConnectParam = {
      chainId: '0x2',
    };

    const { result } = renderHook(() =>
      useHandleConnectEvent(
        debug,
        setConnecting,
        setConnected,
        setChainId,
        setError,
        undefined,
      ),
    );
    result.current(mockConnectParam);

    expect(console.debug).not.toHaveBeenCalled();
    expect(setConnecting).toHaveBeenCalledWith(false);
    expect(setConnected).toHaveBeenCalledWith(true);
    expect(setChainId).toHaveBeenCalledWith(mockConnectParam.chainId);
    expect(setError).toHaveBeenCalledWith(undefined);
  });

  it('should prioritize external chainId over connectParam chainId', () => {
    const debug = false;
    const mockConnectParam = {
      chainId: '0x2',
    };
    const externalChainId = '0x3';

    const { result } = renderHook(() =>
      useHandleConnectEvent(
        debug,
        setConnecting,
        setConnected,
        setChainId,
        setError,
        externalChainId,
      ),
    );
    result.current(mockConnectParam);

    expect(setConnecting).toHaveBeenCalledWith(false);
    expect(setConnected).toHaveBeenCalledWith(true);
    expect(setChainId).toHaveBeenCalledWith(externalChainId);
    expect(setError).toHaveBeenCalledWith(undefined);
  });
});
