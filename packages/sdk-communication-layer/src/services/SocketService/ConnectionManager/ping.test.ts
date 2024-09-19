import { SocketService } from '../../../SocketService';
import { logger } from '../../../utils/logger';
import { EventType } from '../../../types/EventType';
import { MessageType } from '../../../types/MessageType';
import { ping } from './ping';

describe('ping', () => {
  let instance: SocketService;
  const spyLogger = jest.spyOn(logger, 'SocketService');
  const mockEmit = jest.fn();
  const mockSendMessage = jest.fn();
  const mockAreKeysExchanged = jest.fn();
  const mockStart = jest.fn();
  const spyWarn = jest.spyOn(console, 'warn').mockImplementation();

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

    expect(mockEmit).toHaveBeenCalledWith(EventType.MESSAGE, {
      id: 'sampleChannelId',
      context: 'someContext',
      clientType: 'wallet',
      message: {
        type: MessageType.PING,
      },
    });
  });

  it('should send a READY message if originator and keys are exchanged', async () => {
    instance.state.isOriginator = true;
    mockAreKeysExchanged.mockReturnValue(true);

    await ping(instance);

    expect(spyWarn).toHaveBeenCalledWith(
      '[SocketService:ping()] context=someContext sending READY message',
    );
    expect(mockSendMessage).toHaveBeenCalledWith({ type: MessageType.READY });
  });

  it('should start key exchange if originator and keys are not exchanged', async () => {
    instance.state.isOriginator = true;
    mockAreKeysExchanged.mockReturnValue(false);

    await ping(instance);

    expect(spyWarn).toHaveBeenCalledWith(
      '[SocketService: ping()] context=someContext starting key exchange',
    );

    expect(mockStart).toHaveBeenCalledWith({
      isOriginator: true,
    });
  });

  it('should handle missing keyExchange object gracefully', async () => {
    instance.state.keyExchange = undefined;

    await ping(instance);

    expect(spyLogger).toHaveBeenCalledWith(
      '[SocketService: ping()] context=someContext originator=false keysExchanged=undefined',
    );

    expect(mockEmit).toHaveBeenCalledWith(EventType.MESSAGE, {
      id: 'sampleChannelId',
      context: 'someContext',
      clientType: 'wallet',
      message: {
        type: MessageType.PING,
      },
    });
  });
});
