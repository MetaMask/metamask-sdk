import { SocketService } from '../../../SocketService';
import { ping } from './ping';

describe('ping', () => {
  let instance: SocketService;
  const mockEmit = jest.fn();
  const mockSendMessage = jest.fn();
  const mockAreKeysExchanged = jest.fn();
  const mockStart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
        context: 'someContext',
        isOriginator: false,
        channelId: 'sampleChannelId',
        keyExchange: {
          areKeysExchanged: mockAreKeysExchanged,
          start: mockStart,
        },
        socket: {
          emit: mockEmit,
        },
      },
      sendMessage: mockSendMessage,
    } as unknown as SocketService;
  });

  it('should log debug information when debugging is enabled', () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    instance.state.debug = true;

    ping(instance);

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      expect.stringContaining('SocketService::someContext::ping()'),
    );

    consoleDebugSpy.mockRestore();
  });
});
