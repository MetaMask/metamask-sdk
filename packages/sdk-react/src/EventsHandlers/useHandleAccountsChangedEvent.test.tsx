import { renderHook } from '@testing-library/react-hooks';
import { useHandleAccountsChangedEvent } from './useHandleAccountsChangedEvent';

describe('useHandleAccountsChangedEvent', () => {
  let setAccount: jest.Mock;
  let setConnected: jest.Mock;
  let setError: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    setAccount = jest.fn();
    setConnected = jest.fn();
    setError = jest.fn();
  });

  it('should handle accounts changed event correctly with debug', () => {
    const debug = true;
    const newAccountsMock = ['0x1234567890abcdef'];

    const { result } = renderHook(() =>
      useHandleAccountsChangedEvent(debug, setAccount, setConnected, setError),
    );
    result.current(newAccountsMock);

    expect(setAccount).toHaveBeenCalledWith(newAccountsMock[0]);
    expect(setConnected).toHaveBeenCalledWith(true);
    expect(setError).toHaveBeenCalledWith(undefined);
  });

  it('should handle accounts changed event without debug', () => {
    const debug = false;
    const newAccountsMock = ['0x1234567890abcdef'];

    const { result } = renderHook(() =>
      useHandleAccountsChangedEvent(debug, setAccount, setConnected, setError),
    );

    result.current(newAccountsMock);

    expect(setAccount).toHaveBeenCalledWith(newAccountsMock[0]);
    expect(setConnected).toHaveBeenCalledWith(true);
    expect(setError).toHaveBeenCalledWith(undefined);
  });
});
