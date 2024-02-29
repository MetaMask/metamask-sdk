import { renderHook } from '@testing-library/react-hooks';
import { useHandleSDKStatusEvent } from './useHandleSDKStatusEvent';
import { EventType } from '@metamask/sdk';
import { EventHandlerProps } from '../MetaMaskProvider';
import * as loggerModule from '../utils/logger';

describe('handleSDKStatusEvent', () => {
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  const eventHandlerProps = {
    setStatus: jest.fn(),
  } as unknown as EventHandlerProps;

  beforeEach(() => {
    jest.clearAllMocks();

    eventHandlerProps.setStatus = jest.fn();
  });

  it('should handle SDK status event correctly with debug enabled', () => {
    const mockServiceStatus = {
      connectionStatus: 'connected',
    } as any;

    const { result } = renderHook(() =>
      useHandleSDKStatusEvent(eventHandlerProps),
    );

    result.current(mockServiceStatus);

    expect(spyLogger).toHaveBeenCalledWith(
      `[MetaMaskProvider: useHandleSDKStatusEvent()] on '${EventType.SERVICE_STATUS}/${mockServiceStatus.connectionStatus}' event.`,
      mockServiceStatus,
    );
    expect(eventHandlerProps.setStatus).toHaveBeenCalledWith(mockServiceStatus);
  });
});
