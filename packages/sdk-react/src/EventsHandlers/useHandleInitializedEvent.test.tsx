import { renderHook } from '@testing-library/react-hooks';
import { useHandleInitializedEvent } from './useHandleInitializedEvent';

describe('useHandleInitializedEvent', () => {
  let setConnecting: jest.Mock;
  let setAccount: jest.Mock;
  let setConnected: jest.Mock;
  let setError: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    setConnecting = jest.fn();
    setAccount = jest.fn();
    setConnected = jest.fn();
    setError = jest.fn();

    console.debug = jest.fn();
  });

  it('should handle initialized event correctly with debug enabled', () => {
    const debug = true;
    const mockActiveProvider = {
      selectedAddress: '0x12345Abcdef',
    } as any;

    const { result } = renderHook(() =>
      useHandleInitializedEvent(
        debug,
        setConnecting,
        setAccount,
        mockActiveProvider,
        setConnected,
        setError,
      ),
    );
    result.current();

    expect(console.debug).toHaveBeenCalledWith(
      "MetaMaskProvider::provider on '_initialized' event.",
    );
    expect(setConnecting).toHaveBeenCalledWith(false);
    expect(setAccount).toHaveBeenCalledWith(mockActiveProvider.selectedAddress);
    expect(setConnected).toHaveBeenCalledWith(true);
    expect(setError).toHaveBeenCalledWith(undefined);
  });

  it('should handle initialized event without debug logs', () => {
    const debug = false;
    const mockActiveProvider = {
      selectedAddress: '0x12345Abcdef',
    } as any;

    const { result } = renderHook(() =>
      useHandleInitializedEvent(
        debug,
        setConnecting,
        setAccount,
        mockActiveProvider,
        setConnected,
        setError,
      ),
    );
    result.current();

    expect(console.debug).not.toHaveBeenCalled();
    expect(setConnecting).toHaveBeenCalledWith(false);
    expect(setAccount).toHaveBeenCalledWith(mockActiveProvider.selectedAddress);
    expect(setConnected).toHaveBeenCalledWith(true);
    expect(setError).toHaveBeenCalledWith(undefined);
  });

  it('should handle scenario where activeProvider has no selectedAddress', () => {
    const debug = false;
    const mockActiveProvider = {};

    const { result } = renderHook(() =>
      useHandleInitializedEvent(
        debug,
        setConnecting,
        setAccount,
        mockActiveProvider as any,
        setConnected,
        setError,
      ),
    );
    result.current();

    expect(setConnecting).toHaveBeenCalledWith(false);
    expect(setAccount).toHaveBeenCalledWith(undefined);
    expect(setConnected).toHaveBeenCalledWith(true);
    expect(setError).toHaveBeenCalledWith(undefined);
  });
});
