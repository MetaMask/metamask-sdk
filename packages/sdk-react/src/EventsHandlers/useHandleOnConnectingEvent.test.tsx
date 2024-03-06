import { renderHook } from '@testing-library/react-hooks';
import { useHandleOnConnectingEvent } from './useHandleOnConnectingEvent';
import { EventHandlerProps } from '../MetaMaskProvider';
import * as loggerModule from '../utils/logger';

describe('useHandleOnConnectingEvent', () => {
  const spyLogger = jest.spyOn(loggerModule, 'logger');

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
  });

  it('should handle connecting event correctly', () => {
    const { result } = renderHook(() =>
      useHandleOnConnectingEvent(eventHandlerProps),
    );
    result.current();

    expect(spyLogger).toHaveBeenCalledWith(
      "[MetaMaskProvider: useHandleOnConnectingEvent()] on 'connecting' event.",
    );
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(true);
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(undefined);
  });
});
