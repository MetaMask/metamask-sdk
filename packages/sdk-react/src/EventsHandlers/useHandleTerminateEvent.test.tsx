import { renderHook } from '@testing-library/react-hooks';
import { useHandleTerminateEvent } from './useHandleTerminateEvent';
import { EventHandlerProps } from '../MetaMaskProvider';
import * as loggerModule from '../utils/logger';

describe('useHandleTerminateEvent', () => {
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  const eventHandlerProps = {
    setConnecting: jest.fn(),
    setConnected: jest.fn(),
    setError: jest.fn(),
    debug: true,
  } as unknown as EventHandlerProps;

  beforeEach(() => {
    jest.clearAllMocks();

    eventHandlerProps.setConnecting = jest.fn();
    eventHandlerProps.setConnected = jest.fn();
    eventHandlerProps.setError = jest.fn();
  });

  it('should handle the terminate event correctly', () => {
    const mockReason = { message: 'Terminated due to xyz', code: -32000 };

    const { result } = renderHook(() =>
      useHandleTerminateEvent(eventHandlerProps),
    );
    result.current(mockReason);

    expect(spyLogger).toHaveBeenCalledWith(
      "[MetaMaskProvider: useHandleTerminateEvent()] on 'terminate' event.",
      mockReason,
    );

    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(mockReason);
  });
});
