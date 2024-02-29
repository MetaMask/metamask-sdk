import { renderHook } from '@testing-library/react-hooks';
import { useHandleInitializedEvent } from './useHandleInitializedEvent';
import { EventHandlerProps } from '../MetaMaskProvider';
import { SDKProvider } from '@metamask/sdk';
import * as loggerModule from '../utils/logger';

describe('useHandleInitializedEvent', () => {
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  const eventHandlerProps = {
    setConnected: jest.fn(),
    setError: jest.fn(),
    setAccount: jest.fn(),
    setConnecting: jest.fn(),
    debug: true,
    activeProvider: {} as SDKProvider,
  } as unknown as EventHandlerProps;

  beforeEach(() => {
    jest.clearAllMocks();

    eventHandlerProps.setConnected = jest.fn();
    eventHandlerProps.setError = jest.fn();
    eventHandlerProps.setAccount = jest.fn();
    eventHandlerProps.setConnecting = jest.fn();
    eventHandlerProps.debug = true;
    eventHandlerProps.activeProvider = {} as SDKProvider;
  });

  it('should handle initialized event correctly with debug enabled', () => {
    eventHandlerProps.activeProvider = {
      selectedAddress: '0x12345Abcdef',
    } as unknown as SDKProvider;

    const { result } = renderHook(() =>
      useHandleInitializedEvent(eventHandlerProps),
    );
    result.current();

    expect(spyLogger).toHaveBeenCalledWith(
      "[MetaMaskProvider: useHandleInitializedEvent()] on '_initialized' event.",
    );

    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(true);
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(undefined);
  });

  it('should handle scenario where activeProvider has no selectedAddress', () => {
    eventHandlerProps.debug = false;
    eventHandlerProps.activeProvider = {} as unknown as SDKProvider;

    const { result } = renderHook(() =>
      useHandleInitializedEvent(eventHandlerProps),
    );
    result.current();

    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(true);
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(undefined);
  });
});
