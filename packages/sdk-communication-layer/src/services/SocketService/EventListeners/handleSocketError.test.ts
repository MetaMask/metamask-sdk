import { SocketService } from '../../../SocketService';
import { checkFocusAndReconnect } from '../ConnectionManager';
import { logger } from '../../../utils/logger';
import { handleSocketError } from './handleSocketError';

jest.mock('../ConnectionManager');

describe('handleSocketError', () => {
  let instance: SocketService;

  const spyLogger = jest.spyOn(logger, 'SocketService');
  const error = new Error('Test error');

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
      },
    } as unknown as SocketService;
  });

  it('should log the error when debugging is enabled', () => {
    const handler = handleSocketError(instance);
    handler(error);

    expect(spyLogger).toHaveBeenCalledWith(
      `[SocketService: handleSocketError()] on 'error' `,
      error,
    );
  });

  it('should call the checkFocusAndReconnect function', () => {
    const handler = handleSocketError(instance);
    handler(error);

    expect(checkFocusAndReconnect).toHaveBeenCalledWith(instance);
  });
});
