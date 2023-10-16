import { renderHook } from '@testing-library/react-hooks';
import { useHandleDisconnectEvent } from './useHandleDisconnectEvent';
import { EventHandlerProps } from '../MetaMaskProvider';

describe('useHandleDisconnectEvent', () => {
  const eventHandlerProps = {
    setConnected: jest.fn(),
    setError: jest.fn(),
    setConnecting: jest.fn(),
    debug: true,
  } as unknown as EventHandlerProps;

  beforeEach(() => {
    jest.clearAllMocks();

    eventHandlerProps.setConnecting = jest.fn();
    eventHandlerProps.setConnected = jest.fn();
    eventHandlerProps.setError = jest.fn();

    console.debug = jest.fn();
  });

  it('should handle disconnect event correctly with debug enabled', () => {
    eventHandlerProps.debug = true;
    const mockReason = { message: 'Disconnected due to xyz', code: -32000 };

    const { result } = renderHook(() =>
      useHandleDisconnectEvent(eventHandlerProps),
    );
    result.current(mockReason);

    expect(console.debug).toHaveBeenCalledWith(
      "MetaMaskProvider::provider on 'disconnect' event.",
      mockReason,
    );
    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(mockReason);
  });

  it('should handle disconnect event without debug logs', () => {
    eventHandlerProps.debug = false;
    const mockReason = { message: 'Disconnected due to xyz', code: -32000 };

    const { result } = renderHook(() =>
      useHandleDisconnectEvent(eventHandlerProps),
    );
    result.current(mockReason);

    expect(console.debug).not.toHaveBeenCalled();
    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(mockReason);
  });
});
