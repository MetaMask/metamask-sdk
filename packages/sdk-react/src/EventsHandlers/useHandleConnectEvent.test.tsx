import { renderHook } from '@testing-library/react-hooks';
import { useHandleConnectEvent } from './useHandleConnectEvent';
import { EventHandlerProps } from '../MetaMaskProvider';

describe('useHandleConnectEvent', () => {
  const eventHandlerProps = {
    setConnected: jest.fn(),
    setError: jest.fn(),
    setConnecting: jest.fn(),
    setChainId: jest.fn(),
    debug: true,
  } as unknown as EventHandlerProps;

  beforeEach(() => {
    jest.clearAllMocks();

    eventHandlerProps.setConnecting = jest.fn();
    eventHandlerProps.setConnected = jest.fn();
    eventHandlerProps.setChainId = jest.fn();
    eventHandlerProps.setError = jest.fn();

    console.debug = jest.fn();
  });

  it('should handle connect event correctly with debug enabled', () => {
    eventHandlerProps.debug = true;
    const mockConnectParam = {
      chainId: '0x2',
    };

    const { result } = renderHook(() =>
      useHandleConnectEvent(eventHandlerProps),
    );
    result.current(mockConnectParam);

    expect(console.debug).toHaveBeenCalledWith(
      "MetaMaskProvider::provider on 'connect' event.",
      mockConnectParam,
    );
    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(true);
    expect(eventHandlerProps.setChainId).toHaveBeenCalledWith(
      mockConnectParam.chainId,
    );
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(undefined);
  });

  it('should handle connect event without debug logs', () => {
    eventHandlerProps.debug = false;
    const mockConnectParam = {
      chainId: '0x2',
    };

    const { result } = renderHook(() =>
      useHandleConnectEvent(eventHandlerProps),
    );
    result.current(mockConnectParam);

    expect(console.debug).not.toHaveBeenCalled();
    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(true);
    expect(eventHandlerProps.setChainId).toHaveBeenCalledWith(
      mockConnectParam.chainId,
    );
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(undefined);
  });

  it('should prioritize external chainId over connectParam chainId', () => {
    eventHandlerProps.debug = false;
    const mockConnectParam = {
      chainId: '0x2',
    };

    eventHandlerProps.chainId = '0x3';

    const { result } = renderHook(() =>
      useHandleConnectEvent(eventHandlerProps),
    );
    result.current(mockConnectParam);

    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(true);
    expect(eventHandlerProps.setChainId).toHaveBeenCalledWith(
      mockConnectParam.chainId,
    );
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(undefined);
  });
});
