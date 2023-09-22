import { EventType, PROVIDER_UPDATE_TYPE } from '@metamask/sdk';
import { useHandleProviderEvent } from './useHandleProviderEvent';
import { renderHook } from '@testing-library/react-hooks';

describe('useHandleProviderEvent', () => {
  let setConnecting: jest.Mock;
  let setTrigger: jest.Mock;
  let setConnected: jest.Mock;
  let setError: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    setConnecting = jest.fn();
    setTrigger = jest.fn();
    setConnected = jest.fn();
    setError = jest.fn();

    console.debug = jest.fn();
  });

  it('should handle provider event correctly with debug enabled and TERMINATE type', () => {
    const debug = true;
    const type = PROVIDER_UPDATE_TYPE.TERMINATE;

    const { result } = renderHook(() =>
      useHandleProviderEvent(
        debug,
        setConnecting,
        setConnected,
        setTrigger,
        setError,
      ),
    );
    result.current(type);

    expect(console.debug).toHaveBeenCalledWith(
      `MetaMaskProvider::sdk on '${EventType.PROVIDER_UPDATE}' event.`,
      type,
    );
    expect(setConnecting).toHaveBeenCalledWith(false);
    expect(setTrigger).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should handle provider event with EXTENSION type', () => {
    const debug = true;
    const type = PROVIDER_UPDATE_TYPE.EXTENSION;

    const { result } = renderHook(() =>
      useHandleProviderEvent(
        debug,
        setConnecting,
        setConnected,
        setTrigger,
        setError,
      ),
    );
    result.current(type);

    expect(setConnecting).toHaveBeenCalledWith(false);
    expect(setConnected).toHaveBeenCalledWith(true);
    expect(setError).toHaveBeenCalledWith(undefined);
    expect(setTrigger).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should handle provider event without debug logs', () => {
    const debug = false;
    const type = PROVIDER_UPDATE_TYPE.TERMINATE;

    const { result } = renderHook(() =>
      useHandleProviderEvent(
        debug,
        setConnecting,
        setConnected,
        setTrigger,
        setError,
      ),
    );
    result.current(type);

    expect(console.debug).not.toHaveBeenCalled();
    expect(setConnecting).toHaveBeenCalledWith(false);
    expect(setTrigger).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should increment the trigger value', () => {
    const type = PROVIDER_UPDATE_TYPE.TERMINATE;
    setTrigger.mockImplementation((fn: (prev: number) => number) => {
      const newValue = fn(2);
      expect(newValue).toBe(3);
    });

    const { result } = renderHook(() =>
      useHandleProviderEvent(
        undefined,
        setConnecting,
        setConnected,
        setTrigger,
        setError,
      ),
    );
    result.current(type);
  });
});
