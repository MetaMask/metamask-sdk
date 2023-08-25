import { handleReconnectError } from '../handleReconnectError';
import { SocketService } from '../../../../SocketService';

describe('handleReconnectError', () => {
  let instance: SocketService;
  const mockConsoleDebug = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
      },
    } as unknown as SocketService;

    jest.spyOn(console, 'debug').mockImplementation(mockConsoleDebug);
  });

  it('should log a debug message with error details when the handler is called and debugging is enabled', () => {
    instance.state.debug = true;
    const mockError = new Error('Reconnect error');

    const handler = handleReconnectError(instance);
    handler(mockError);

    expect(mockConsoleDebug).toHaveBeenCalledWith(
      `SocketService::on 'reconnect_error'`,
      mockError,
    );
  });

  it('should not log a debug message when debugging is disabled', () => {
    instance.state.debug = false;
    const mockError = new Error('Reconnect error');

    const handler = handleReconnectError(instance);
    handler(mockError);

    expect(mockConsoleDebug).not.toHaveBeenCalled();
  });
});
