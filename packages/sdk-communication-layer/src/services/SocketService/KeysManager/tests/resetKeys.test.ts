import { SocketService } from '../../../../SocketService';
import { resetKeys } from '../resetKeys';

describe('resetKeys', () => {
  let instance: SocketService;
  const mockConsoleDebug = jest.spyOn(console, 'debug');
  const mockResetKeys = jest.fn();

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

  it('should not log debug message if debugging is disabled', () => {
    resetKeys(instance);
    expect(mockConsoleDebug).not.toHaveBeenCalled();
  });

  it('should log debug message if debugging is enabled', () => {
    instance.state.debug = true;
    resetKeys(instance);
    expect(mockConsoleDebug).toHaveBeenCalledWith('SocketService::resetKeys()');
  });
});
