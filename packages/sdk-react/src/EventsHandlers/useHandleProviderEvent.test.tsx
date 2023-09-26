import { EventType, PROVIDER_UPDATE_TYPE } from '@metamask/sdk';
import { useHandleProviderEvent } from './useHandleProviderEvent';
import { renderHook } from '@testing-library/react-hooks';
import { EventHandlerProps } from '../MetaMaskProvider';

describe('useHandleProviderEvent', () => {
  const eventHandlerProps = {
    setConnected: jest.fn(),
    setConnecting: jest.fn(),
    setError: jest.fn(),
    setTrigger: jest.fn(),
    debug: true,
  } as unknown as EventHandlerProps;

  beforeEach(() => {
    jest.clearAllMocks();

    eventHandlerProps.setConnecting = jest.fn();
    eventHandlerProps.setTrigger = jest.fn();
    eventHandlerProps.setConnected = jest.fn();
    eventHandlerProps.setError = jest.fn();

    console.debug = jest.fn();
  });

  it('should handle provider event correctly with debug enabled and TERMINATE type', () => {
    eventHandlerProps.debug = true;
    const type = PROVIDER_UPDATE_TYPE.TERMINATE;

    const { result } = renderHook(() =>
      useHandleProviderEvent(eventHandlerProps),
    );
    result.current(type);

    expect(console.debug).toHaveBeenCalledWith(
      `MetaMaskProvider::sdk on '${EventType.PROVIDER_UPDATE}' event.`,
      type,
    );
    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setTrigger).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  it('should handle provider event with EXTENSION type', () => {
    eventHandlerProps.debug = true;
    const type = PROVIDER_UPDATE_TYPE.EXTENSION;

    const { result } = renderHook(() =>
      useHandleProviderEvent(eventHandlerProps),
    );
    result.current(type);

    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(true);
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(undefined);
    expect(eventHandlerProps.setTrigger).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  it('should handle provider event without debug logs', () => {
    eventHandlerProps.debug = false;
    const type = PROVIDER_UPDATE_TYPE.TERMINATE;

    const { result } = renderHook(() =>
      useHandleProviderEvent(eventHandlerProps),
    );
    result.current(type);

    expect(console.debug).not.toHaveBeenCalled();
    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setTrigger).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  it('should increment the trigger value', () => {
    const type = PROVIDER_UPDATE_TYPE.TERMINATE;

    (eventHandlerProps.setTrigger as jest.Mock).mockImplementation(
      (fn: (prev: number) => number) => {
        const newValue = fn(2);
        expect(newValue).toBe(3);
      },
    );

    const { result } = renderHook(() =>
      useHandleProviderEvent(eventHandlerProps),
    );
    result.current(type);
  });
});
