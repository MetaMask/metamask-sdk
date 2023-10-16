import { renderHook } from '@testing-library/react-hooks';
import { useHandleOnConnectingEvent } from './useHandleOnConnectingEvent';
import { EventHandlerProps } from '../MetaMaskProvider';

describe('useHandleOnConnectingEvent', () => {
  const eventHandlerProps = {
    setConnected: jest.fn(),
    setError: jest.fn(),
    setConnecting: jest.fn(),
    debug: true,
  } as unknown as EventHandlerProps;

  beforeEach(() => {
    jest.clearAllMocks();

    eventHandlerProps.setConnected = jest.fn();
    eventHandlerProps.setConnecting = jest.fn();
    eventHandlerProps.setError = jest.fn();

    console.debug = jest.fn();
  });

  it('should handle connecting event correctly with debug enabled', () => {
    eventHandlerProps.debug = true;

    const { result } = renderHook(() =>
      useHandleOnConnectingEvent(eventHandlerProps),
    );
    result.current();

    expect(console.debug).toHaveBeenCalledWith(
      "MetaMaskProvider::provider on 'connecting' event.",
    );
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(true);
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(undefined);
  });

  it('should handle connecting event without debug logs', () => {
    eventHandlerProps.debug = false;

    const { result } = renderHook(() =>
      useHandleOnConnectingEvent(eventHandlerProps),
    );
    result.current();

    expect(console.debug).not.toHaveBeenCalled();
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(true);
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(undefined);
  });
});
