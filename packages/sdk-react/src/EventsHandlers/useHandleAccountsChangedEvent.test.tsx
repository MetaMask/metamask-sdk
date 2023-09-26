import { renderHook } from '@testing-library/react-hooks';
import { useHandleAccountsChangedEvent } from './useHandleAccountsChangedEvent';
import { EventHandlerProps } from '../MetaMaskProvider';

describe('useHandleAccountsChangedEvent', () => {
  const eventHandlerProps = {
    setConnected: jest.fn(),
    setError: jest.fn(),
    setAccount: jest.fn(),
    debug: true,
  } as unknown as EventHandlerProps;

  beforeEach(() => {
    jest.clearAllMocks();

    eventHandlerProps.setAccount = jest.fn();
    eventHandlerProps.setConnected = jest.fn();
    eventHandlerProps.setError = jest.fn();
  });

  it('should handle accounts changed event correctly with debug', () => {
    eventHandlerProps.debug = true;
    const newAccountsMock = ['0x1234567890abcdef'];

    const { result } = renderHook(() =>
      useHandleAccountsChangedEvent(eventHandlerProps),
    );
    result.current(newAccountsMock);

    expect(eventHandlerProps.setAccount).toHaveBeenCalledWith(
      newAccountsMock[0],
    );
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(true);
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(undefined);
  });

  it('should handle accounts changed event without debug', () => {
    eventHandlerProps.debug = false;
    const newAccountsMock = ['0x1234567890abcdef'];

    const { result } = renderHook(() =>
      useHandleAccountsChangedEvent(eventHandlerProps),
    );

    result.current(newAccountsMock);

    expect(eventHandlerProps.setAccount).toHaveBeenCalledWith(
      newAccountsMock[0],
    );
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(true);
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(undefined);
  });
});
