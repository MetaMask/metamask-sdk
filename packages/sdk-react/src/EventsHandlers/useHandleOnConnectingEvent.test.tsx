import { renderHook } from '@testing-library/react-hooks';
import { useHandleOnConnectingEvent } from './useHandleOnConnectingEvent';

describe('useHandleOnConnectingEvent', () => {
  let setConnected: jest.Mock;
  let setConnecting: jest.Mock;
  let setError: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    setConnected = jest.fn();
    setConnecting = jest.fn();
    setError = jest.fn();

    console.debug = jest.fn();
  });

  it('should handle connecting event correctly with debug enabled', () => {
    const debug = true;

    const { result } = renderHook(() =>
      useHandleOnConnectingEvent(debug, setConnected, setConnecting, setError),
    );
    result.current();

    expect(console.debug).toHaveBeenCalledWith(
      "MetaMaskProvider::provider on 'connecting' event.",
    );
    expect(setConnected).toHaveBeenCalledWith(false);
    expect(setConnecting).toHaveBeenCalledWith(true);
    expect(setError).toHaveBeenCalledWith(undefined);
  });

  it('should handle connecting event without debug logs', () => {
    const debug = false;

    const { result } = renderHook(() =>
      useHandleOnConnectingEvent(debug, setConnected, setConnecting, setError),
    );
    result.current();

    expect(console.debug).not.toHaveBeenCalled();
    expect(setConnected).toHaveBeenCalledWith(false);
    expect(setConnecting).toHaveBeenCalledWith(true);
    expect(setError).toHaveBeenCalledWith(undefined);
  });
});
