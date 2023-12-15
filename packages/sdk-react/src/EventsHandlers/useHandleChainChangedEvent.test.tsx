import { renderHook } from '@testing-library/react-hooks';
import { useHandleChainChangedEvent } from './useHandleChainChangedEvent';
import { EventHandlerProps } from '../MetaMaskProvider';

describe('useHandleChainChangedEvent', () => {
  const eventHandlerProps = {
    setConnected: jest.fn(),
    setError: jest.fn(),
    setConnecting: jest.fn(),
    setChainId: jest.fn(),
    debug: true,
  } as unknown as EventHandlerProps;

  beforeEach(() => {
    jest.clearAllMocks();

    eventHandlerProps.setChainId = jest.fn();
    eventHandlerProps.setConnected = jest.fn();
    eventHandlerProps.setConnecting = jest.fn();
    eventHandlerProps.setError = jest.fn();

    console.debug = jest.fn();
  });

  it('should handle chain changed event with object and debug enabled', () => {
    eventHandlerProps.debug = true;
    const mockNetworkVersion = {
      chainId: '0x1',
      networkVersion: '1',
    };

    const { result } = renderHook(() =>
      useHandleChainChangedEvent(eventHandlerProps),
    );
    result.current(mockNetworkVersion);

    expect(console.debug).toHaveBeenCalledWith(
      "MetaMaskProvider::provider on 'chainChanged' event.",
      mockNetworkVersion,
    );
    expect(eventHandlerProps.setChainId).toHaveBeenCalledWith(
      mockNetworkVersion.chainId,
    );
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(true);
    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(undefined);
  });

  it('should handle chain changed event with string and debug enabled', () => {
    eventHandlerProps.debug = true;
    const chainId = '0x1';

    const { result } = renderHook(() =>
      useHandleChainChangedEvent(eventHandlerProps),
    );
    result.current(chainId);

    expect(console.debug).toHaveBeenCalledWith(
      "MetaMaskProvider::provider on 'chainChanged' event.",
      chainId,
    );
    expect(eventHandlerProps.setChainId).toHaveBeenCalledWith(chainId);
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(true);
    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(undefined);
  });

  it('should handle chain changed event without debug logs', () => {
    eventHandlerProps.debug = false;
    const chainId = '0x1';

    const { result } = renderHook(() =>
      useHandleChainChangedEvent(eventHandlerProps),
    );
    result.current(chainId);

    expect(console.debug).not.toHaveBeenCalled();
    expect(eventHandlerProps.setChainId).toHaveBeenCalledWith(chainId);
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(true);
    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(undefined);
  });
});
