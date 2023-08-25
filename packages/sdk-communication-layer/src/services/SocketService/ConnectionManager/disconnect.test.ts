import { SocketService } from '../../../SocketService';
import { disconnect } from './disconnect';

describe('disconnect', () => {
  let instance: SocketService;
  const mockDisconnect = jest.fn();
  const mockClean = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
        context: 'someContext',
        socket: {
          disconnect: mockDisconnect,
        },
        keyExchange: {
          clean: mockClean,
        },
      },
    } as unknown as SocketService;
  });

  it('should disconnect the socket', () => {
    disconnect(instance);

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should log debug information when debugging is enabled', () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    instance.state.debug = true;

    disconnect(instance);

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      'SocketService::someContext::disconnect()',
      undefined,
    );

    consoleDebugSpy.mockRestore();
  });

  it('should handle termination and key exchange clean when provided', () => {
    const options = {
      terminate: true,
      channelId: 'channel123',
    };

    disconnect(instance, options);

    expect(instance.state.channelId).toBe('channel123');
    expect(mockClean).toHaveBeenCalled();
  });

  it('should reset rpcMethodTracker', () => {
    disconnect(instance);

    expect(instance.state.rpcMethodTracker).toStrictEqual({});
  });

  it('should set manualDisconnect to true', () => {
    disconnect(instance);

    expect(instance.state.manualDisconnect).toBe(true);
  });
});
