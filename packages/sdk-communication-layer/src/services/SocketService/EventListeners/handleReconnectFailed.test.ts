import { SocketService } from '../../../SocketService';
import { logger } from '../../../utils/logger';
import { handleReconnectFailed } from './handleReconnectFailed';

describe('handleReconnectFailed', () => {
  let instance: SocketService;
  const spyLogger = jest.spyOn(logger, 'SocketService');

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
      },
    } as unknown as SocketService;
  });

  it('should log a debug message indicating that reconnection attempts have failed when the handler is called and debugging is enabled', () => {
    instance.state.debug = true;

    const handler = handleReconnectFailed();
    handler();

    expect(spyLogger).toHaveBeenCalledWith(
      "[SocketService: handleReconnectFailed()] on 'reconnect_failed'",
    );
  });
});
