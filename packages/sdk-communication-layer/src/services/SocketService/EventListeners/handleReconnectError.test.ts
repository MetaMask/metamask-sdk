import * as loggerModule from '../../../utils/logger';
import { handleReconnectError } from './handleReconnectError';

describe('handleReconnectError', () => {
  const spyLogger = jest.spyOn(loggerModule, 'loggerServiceLayer');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log a debug message with error details when the handler is called and debugging is enabled', () => {
    const mockError = new Error('Reconnect error');

    const handler = handleReconnectError();
    handler(mockError);

    expect(spyLogger).toHaveBeenCalledWith(
      "[SocketService: handleReconnectError()] on 'reconnect_error'",
      mockError,
    );
  });
});
