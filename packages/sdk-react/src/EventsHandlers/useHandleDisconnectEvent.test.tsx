import { renderHook } from '@testing-library/react-hooks';
import { useHandleDisconnectEvent } from './useHandleDisconnectEvent';
import { EventHandlerProps } from '../MetaMaskProvider';
import * as loggerModule from '../utils/logger';

describe('useHandleDisconnectEvent', () => {
  const spyLogger = jest.spyOn(loggerModule, 'logger');

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
  });

  it('should handle disconnect event correctly', () => {
    const mockReason = { message: 'Disconnected due to xyz', code: -32000 };

    const { result } = renderHook(() =>
      useHandleDisconnectEvent(eventHandlerProps),
    );
    result.current(mockReason);

    expect(spyLogger).toHaveBeenCalledWith(
      "[MetaMaskProvider: useHandleDisconnectEvent()] on 'disconnect' event.",
      mockReason,
    );

    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(mockReason);
  });
});
