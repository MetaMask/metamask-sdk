import * as loggerModule from '../../../utils/logger';
import { handlePing } from './handlePing';

describe('handlePing', () => {
  const spyLogger = jest.spyOn(loggerModule, 'loggerServiceLayer');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log a debug message when the handler is called', () => {
    const handler = handlePing();
    handler();

    expect(spyLogger).toHaveBeenCalledWith(
      "[SocketService: handlePing()] on 'ping'",
    );
  });
});
