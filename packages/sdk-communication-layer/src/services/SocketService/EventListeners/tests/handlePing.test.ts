import { handlePing } from '../handlePing';
import { SocketService } from '../../../../SocketService';

describe('handlePing', () => {
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

  it('should log a debug message when the handler is called and debugging is enabled', () => {
    instance.state.debug = true;

    const handler = handlePing(instance);
    handler();

    expect(mockConsoleDebug).toHaveBeenCalledWith(`SocketService::on 'ping'`);
  });

  it('should not log a debug message when debugging is disabled', () => {
    instance.state.debug = false;

    const handler = handlePing(instance);
    handler();

    expect(mockConsoleDebug).not.toHaveBeenCalled();
  });
});
