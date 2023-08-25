import { SocketService } from '../../../SocketService';
import { handleReconnect } from './handleReconnect';

describe('handleReconnect', () => {
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

  it('should log a debug message with attempt number when the handler is called and debugging is enabled', () => {
    instance.state.debug = true;

    const handler = handleReconnect(instance);
    handler(5);

    expect(mockConsoleDebug).toHaveBeenCalledWith(
      `SocketService::on 'reconnect' attempt=5`,
    );
  });

  it('should not log a debug message when debugging is disabled', () => {
    instance.state.debug = false;

    const handler = handleReconnect(instance);
    handler(3);

    expect(mockConsoleDebug).not.toHaveBeenCalled();
  });
});
