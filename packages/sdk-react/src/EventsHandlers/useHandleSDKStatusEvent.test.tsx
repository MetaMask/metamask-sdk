import { renderHook } from '@testing-library/react-hooks';
import { useHandleSDKStatusEvent } from './useHandleSDKStatusEvent';
import { EventType } from '@metamask/sdk';

describe('handleSDKStatusEvent', () => {
  let setStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    setStatus = jest.fn();

    console.debug = jest.fn();
  });

  it('should handle SDK status event correctly with debug enabled', () => {
    const debug = true;
    const mockServiceStatus = {
      connectionStatus: 'connected',
    } as any;

    const { result } = renderHook(() =>
      useHandleSDKStatusEvent(debug, setStatus),
    );
    result.current(mockServiceStatus);

    expect(console.debug).toHaveBeenCalledWith(
      `MetaMaskProvider::sdk on '${EventType.SERVICE_STATUS}/${mockServiceStatus.connectionStatus}' event.`,
      mockServiceStatus,
    );
    expect(setStatus).toHaveBeenCalledWith(mockServiceStatus);
  });

  it('should handle SDK status event without debug logs', () => {
    const debug = false;
    const mockServiceStatus = {
      connectionStatus: 'connected',
    } as any;

    const { result } = renderHook(() =>
      useHandleSDKStatusEvent(debug, setStatus),
    );
    result.current(mockServiceStatus);

    expect(console.debug).not.toHaveBeenCalled();
    expect(setStatus).toHaveBeenCalledWith(mockServiceStatus);
  });
});
