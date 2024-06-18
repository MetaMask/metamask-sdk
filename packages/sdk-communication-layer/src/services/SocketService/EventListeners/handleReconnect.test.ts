import { logger } from '../../../utils/logger';
import { handleReconnect } from './handleReconnect';

describe('handleReconnect', () => {
  const spyLogger = jest.spyOn(logger, 'SocketService');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log a debug message with attempt number when the handler is called', () => {
    const handler = handleReconnect();
    handler(5);

    expect(spyLogger).toHaveBeenCalledWith(
      "[SocketService: handleReconnect()] on 'reconnect' attempt=5",
    );
  });
});
