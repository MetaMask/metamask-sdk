import { renderHook } from '@testing-library/react-hooks';
import { useHandleDisconnectEvent } from './useHandleDisconnectEvent';

describe('useHandleDisconnectEvent', () => {
  let setConnecting: jest.Mock;
  let setConnected: jest.Mock;
  let setError: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    setConnecting = jest.fn();
    setConnected = jest.fn();
    setError = jest.fn();

    console.debug = jest.fn();
  });

  it('should handle disconnect event correctly with debug enabled', () => {
    const debug = true;
    const mockReason = { message: 'Disconnected due to xyz', code: -32000 };

    const { result } = renderHook(() =>
      useHandleDisconnectEvent(debug, setConnecting, setConnected, setError),
    );
    result.current(mockReason);

    expect(console.debug).toHaveBeenCalledWith(
      "MetaMaskProvider::provider on 'disconnect' event.",
      mockReason,
    );
    expect(setConnecting).toHaveBeenCalledWith(false);
    expect(setConnected).toHaveBeenCalledWith(false);
    expect(setError).toHaveBeenCalledWith(mockReason);
  });

  it('should handle disconnect event without debug logs', () => {
    const debug = false;
    const mockReason = { message: 'Disconnected due to xyz', code: -32000 };

    const { result } = renderHook(() =>
      useHandleDisconnectEvent(debug, setConnecting, setConnected, setError),
    );
    result.current(mockReason);

    expect(console.debug).not.toHaveBeenCalled();
    expect(setConnecting).toHaveBeenCalledWith(false);
    expect(setConnected).toHaveBeenCalledWith(false);
    expect(setError).toHaveBeenCalledWith(mockReason);
  });
});
