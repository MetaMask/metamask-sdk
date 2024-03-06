import { renderHook } from '@testing-library/react-hooks';
import { useHandleChainChangedEvent } from './useHandleChainChangedEvent';
import { EventHandlerProps } from '../MetaMaskProvider';
import * as loggerModule from '../utils/logger';

describe('useHandleChainChangedEvent', () => {
  const spyLogger = jest.spyOn(loggerModule, 'logger');

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
  });

  it('should handle chain changed event with object', () => {
    const mockNetworkVersion = {
      chainId: '0x1',
      networkVersion: '1',
    };

    const { result } = renderHook(() =>
      useHandleChainChangedEvent(eventHandlerProps),
    );

    result.current(mockNetworkVersion);

    expect(spyLogger).toHaveBeenCalledWith(
      "[MetaMaskProvider: useHandleChainChangedEvent()] on 'chainChanged' event.",
      mockNetworkVersion,
    );

    expect(eventHandlerProps.setChainId).toHaveBeenCalledWith(
      mockNetworkVersion.chainId,
    );
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(true);
    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(undefined);
  });

  it('should handle chain changed event with string', () => {
    const chainId = '0x1';

    const { result } = renderHook(() =>
      useHandleChainChangedEvent(eventHandlerProps),
    );
    result.current(chainId);

    expect(spyLogger).toHaveBeenCalledWith(
      "[MetaMaskProvider: useHandleChainChangedEvent()] on 'chainChanged' event.",
      chainId,
    );
    expect(eventHandlerProps.setChainId).toHaveBeenCalledWith(chainId);
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(true);
    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(undefined);
  });
});
