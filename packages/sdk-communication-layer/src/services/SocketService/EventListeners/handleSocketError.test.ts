import { SocketService } from '../../../SocketService';
import { logger } from '../../../utils/logger';
import { reconnectSocket } from '../ConnectionManager/reconnectSocket';
import { handleSocketError } from './handleSocketError';

jest.mock('../ConnectionManager/reconnectSocket', () => ({
  reconnectSocket: jest.fn().mockResolvedValue(undefined), // Mock to return a resolved promise
}));

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

    // Verify the mock
    console.log(reconnectSocket); // Should log a mock function
  });

  it('should log the error when debugging is enabled', () => {
    const handler = handleSocketError(instance);
    handler(error);

    expect(spyLogger).toHaveBeenCalledWith(
      `[SocketService: handleSocketError()] on 'error' `,
      error,
    );
  });

  it('should call the reconnect function', () => {
    const handler = handleSocketError(instance);
    handler(error);

    expect(reconnectSocket).toHaveBeenCalledWith(instance);
  });
});
