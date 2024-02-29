import { SocketService } from '../../../SocketService';
import * as loggerModule from '../../../utils/logger';
import { ping } from './ping';

describe('ping', () => {
  let instance: SocketService;
  const spyLogger = jest.spyOn(loggerModule, 'loggerServiceLayer');
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

  it('should log debug information', () => {
    ping(instance);

    expect(spyLogger).toHaveBeenCalledWith(
      '[SocketService: ping()] context=someContext originator=false keysExchanged=undefined',
    );
  });
});
