import { ping } from '../ping';
import { SocketService } from '../../../../SocketService';
import { MessageType } from '../../../../types/MessageType';
import { EventType } from '../../../../types/EventType';

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

  it('should send READY message when keys have been exchanged', () => {
    mockAreKeysExchanged.mockReturnValueOnce(true);

    ping(instance);

    expect(mockSendMessage).toHaveBeenCalledWith({ type: MessageType.READY });
  });

  it('should initiate key exchange process when keys have not been exchanged', () => {
    mockAreKeysExchanged.mockReturnValueOnce(false);

    ping(instance);

    expect(mockStart).toHaveBeenCalledWith({ isOriginator: false });
  });

  it('should not send READY message or start key exchange when instance is an originator', () => {
    instance.state.isOriginator = true;

    ping(instance);

    expect(mockSendMessage).not.toHaveBeenCalled();
    expect(mockStart).not.toHaveBeenCalled();
  });

  it('should emit PING message to socket', () => {
    ping(instance);

    expect(mockEmit).toHaveBeenCalledWith(EventType.MESSAGE, {
      id: 'sampleChannelId',
      context: 'someContext',
      message: {
        type: MessageType.PING,
      },
    });
  });
});
