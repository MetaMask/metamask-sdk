import { handleInitializedEvent } from './handleInitializedEvent';

describe('handleInitializedEvent', () => {
  let setConnecting: jest.Mock;
  let setAccount: jest.Mock;
  let setConnected: jest.Mock;
  let setError: jest.Mock;

  beforeEach(() => {
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

    const callback = handleInitializedEvent(
      debug,
      setConnecting,
      setAccount,
      mockActiveProvider,
      setConnected,
      setError,
    );

    callback();

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

    const callback = handleInitializedEvent(
      debug,
      setConnecting,
      setAccount,
      mockActiveProvider,
      setConnected,
      setError,
    );

    callback();

    expect(console.debug).not.toHaveBeenCalled();
    expect(setConnecting).toHaveBeenCalledWith(false);
    expect(setAccount).toHaveBeenCalledWith(mockActiveProvider.selectedAddress);
    expect(setConnected).toHaveBeenCalledWith(true);
    expect(setError).toHaveBeenCalledWith(undefined);
  });

  it('should handle scenario where activeProvider has no selectedAddress', () => {
    const debug = false;
    const mockActiveProvider = {};

    const callback = handleInitializedEvent(
      debug,
      setConnecting,
      setAccount,
      mockActiveProvider as any,
      setConnected,
      setError,
    );

    callback();

    expect(setConnecting).toHaveBeenCalledWith(false);
    expect(setAccount).toHaveBeenCalledWith(undefined);
    expect(setConnected).toHaveBeenCalledWith(true);
    expect(setError).toHaveBeenCalledWith(undefined);
  });
});
