import { renderHook } from '@testing-library/react-hooks';
import { useHandleSDKStatusEvent } from './useHandleSDKStatusEvent';
import { EventType } from '@metamask/sdk';
import { EventHandlerProps } from '../MetaMaskProvider';

describe('handleSDKStatusEvent', () => {
  const eventHandlerProps = {
    setStatus: jest.fn(),
  } as unknown as EventHandlerProps;

  beforeEach(() => {
    jest.clearAllMocks();

    eventHandlerProps.setStatus = jest.fn();

    console.debug = jest.fn();
  });

  it('should handle SDK status event correctly with debug enabled', () => {
    eventHandlerProps.debug = true;
    const mockServiceStatus = {
      connectionStatus: 'connected',
    } as any;

    const { result } = renderHook(() =>
      useHandleSDKStatusEvent(eventHandlerProps),
    );
    result.current(mockServiceStatus);

    expect(console.debug).toHaveBeenCalledWith(
      `MetaMaskProvider::sdk on '${EventType.SERVICE_STATUS}/${mockServiceStatus.connectionStatus}' event.`,
      mockServiceStatus,
    );
    expect(eventHandlerProps.setStatus).toHaveBeenCalledWith(mockServiceStatus);
  });

  it('should handle SDK status event without debug logs', () => {
    eventHandlerProps.debug = false;
    const mockServiceStatus = {
      connectionStatus: 'connected',
    } as any;

    const { result } = renderHook(() =>
      useHandleSDKStatusEvent(eventHandlerProps),
    );
    result.current(mockServiceStatus);

    expect(console.debug).not.toHaveBeenCalled();
    expect(eventHandlerProps.setStatus).toHaveBeenCalledWith(mockServiceStatus);
  });
});
