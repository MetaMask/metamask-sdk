import { handleReconnectFailed } from '../handleReconnectFailed';
import { SocketService } from '../../../../SocketService';

describe('handleReconnectFailed', () => {
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

  it('should log a debug message indicating that reconnection attempts have failed when the handler is called and debugging is enabled', () => {
    instance.state.debug = true;

    const handler = handleReconnectFailed(instance);
    handler();

    expect(mockConsoleDebug).toHaveBeenCalledWith(
      `SocketService::on 'reconnect_failed'`,
    );
  });

  it('should not log a debug message when debugging is disabled', () => {
    instance.state.debug = false;

    const handler = handleReconnectFailed(instance);
    handler();

    expect(mockConsoleDebug).not.toHaveBeenCalled();
  });
});
