import { SocketService } from '../../../SocketService';
import { checkFocusAndReconnect } from '../ConnectionManager';
import { handleSocketError } from './handleSocketError';

jest.mock('../ConnectionManager');

describe('handleSocketError', () => {
  let instance: SocketService;
  const mockConsoleDebug = jest.fn();
  const error = new Error('Test error');

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
      },
    } as unknown as SocketService;

    jest.spyOn(console, 'debug').mockImplementation(mockConsoleDebug);
  });

  it('should log the error when debugging is enabled', () => {
    instance.state.debug = true;

    const handler = handleSocketError(instance);
    handler(error);

    expect(mockConsoleDebug).toHaveBeenCalledWith(
      `SocketService::on 'error' `,
      error,
    );
  });

  it('should not log the error when debugging is disabled', () => {
    instance.state.debug = false;

    const handler = handleSocketError(instance);
    handler(error);

    expect(mockConsoleDebug).not.toHaveBeenCalled();
  });

  it('should call the checkFocusAndReconnect function', () => {
    const handler = handleSocketError(instance);
    handler(error);

    expect(checkFocusAndReconnect).toHaveBeenCalledWith(instance);
  });
});
