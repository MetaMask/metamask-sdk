import { SocketService } from '../../../SocketService';
import { MessageType } from '../../../types/MessageType';
import { logger } from '../../../utils/logger';
import { ping } from './ping';

describe('ping', () => {
  let instance: SocketService;
  const spyLogger = jest.spyOn(logger, 'SocketService');
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
      remote: { state: { isOriginator: false } },
      sendMessage: mockSendMessage,
    } as unknown as SocketService;
  });

  it('should log debug information', async () => {
    await ping(instance);

    expect(spyLogger).toHaveBeenCalledWith(
      '[SocketService: ping()] context=someContext originator=false keysExchanged=undefined',
    );
  });

  it('should emit a PING message to the socket', async () => {
    await ping(instance);

    expect(mockEmit).toHaveBeenCalledWith(MessageType.PING, {
      id: 'sampleChannelId',
      context: 'ping',
      clientType: 'wallet',
      message: '',
    });
  });

  it('should use correct clientType based on remote.state.isOriginator', async () => {
    instance.remote.state.isOriginator = true;
    await ping(instance);

    expect(mockEmit).toHaveBeenCalledWith(MessageType.PING, {
      id: 'sampleChannelId',
      context: 'ping',
      clientType: 'dapp',
      message: '',
    });
  });

  it('should handle missing keyExchange object gracefully', async () => {
    instance.state.keyExchange = undefined;

    await ping(instance);

    expect(spyLogger).toHaveBeenCalledWith(
      '[SocketService: ping()] context=someContext originator=false keysExchanged=undefined',
    );

    expect(mockEmit).toHaveBeenCalledWith(MessageType.PING, {
      id: 'sampleChannelId',
      context: 'ping',
      clientType: 'wallet',
      message: '',
    });
  });
});
