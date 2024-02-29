import { SocketService } from '../../../SocketService';
import { logger } from '../../../utils/logger';
import { resetKeys } from './resetKeys';

describe('resetKeys', () => {
  let instance: SocketService;
  const mockConsoleDebug = jest.spyOn(console, 'debug');
  const mockResetKeys = jest.fn();

  const spyLogger = jest.spyOn(logger, 'SocketService');

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
        keyExchange: {
          resetKeys: mockResetKeys,
        },
      },
    } as unknown as SocketService;
  });

  it('should reset the keys using keyExchange', () => {
    resetKeys(instance);
    expect(mockResetKeys).toHaveBeenCalled();
  });

  it('should log debug message', () => {
    instance.state.debug = true;
    resetKeys(instance);
    expect(spyLogger).toHaveBeenCalledWith(
      '[SocketService: resetKeys()] Resetting keys.',
    );
  });
});
