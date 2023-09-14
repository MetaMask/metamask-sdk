import { handleOnConnectingEvent } from './handleOnConnectingEvent';

describe('handleOnConnectingEvent', () => {
  let setConnected: jest.Mock;
  let setConnecting: jest.Mock;
  let setError: jest.Mock;

  beforeEach(() => {
    setConnected = jest.fn();
    setConnecting = jest.fn();
    setError = jest.fn();

    console.debug = jest.fn();
  });

  it('should handle connecting event correctly with debug enabled', () => {
    const debug = true;

    const callback = handleOnConnectingEvent(
      debug,
      setConnected,
      setConnecting,
      setError,
    );
    callback();

    expect(console.debug).toHaveBeenCalledWith(
      "MetaMaskProvider::provider on 'connecting' event.",
    );
    expect(setConnected).toHaveBeenCalledWith(false);
    expect(setConnecting).toHaveBeenCalledWith(true);
    expect(setError).toHaveBeenCalledWith(undefined);
  });

  it('should handle connecting event without debug logs', () => {
    const debug = false;

    const callback = handleOnConnectingEvent(
      debug,
      setConnected,
      setConnecting,
      setError,
    );
    callback();

    expect(console.debug).not.toHaveBeenCalled();
    expect(setConnected).toHaveBeenCalledWith(false);
    expect(setConnecting).toHaveBeenCalledWith(true);
    expect(setError).toHaveBeenCalledWith(undefined);
  });
});
