import { SocketService } from '../../../SocketService';
import { MessageType } from '../../../types/MessageType';
import { logger } from '../../../utils/logger';
import { pause } from './pause';

describe('pause', () => {
  let instance: SocketService;

  const spyLogger = jest.spyOn(logger, 'SocketService');
  const mockDisconnect = jest.fn();
  const mockAreKeysExchanged = jest.fn();
  const mockSendMessage = jest.fn();

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
          areKeysExchanged: mockAreKeysExchanged,
        },
      },
      sendMessage: mockSendMessage,
    } as unknown as SocketService;
  });

  it('should disconnect the socket', () => {
    pause(instance);

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should log debug information', () => {
    pause(instance);

    expect(spyLogger).toHaveBeenCalledWith(
      '[SocketService: pause()] context=someContext',
    );
  });

  it('should set manualDisconnect to true', () => {
    pause(instance);

    expect(instance.state.manualDisconnect).toBe(true);
  });

  it('should send PAUSE message when keys have been exchanged', () => {
    mockAreKeysExchanged.mockReturnValueOnce(true);

    pause(instance);

    expect(mockSendMessage).toHaveBeenCalledWith({ type: MessageType.PAUSE });
  });

  it('should not send PAUSE message when keys have not been exchanged', () => {
    mockAreKeysExchanged.mockReturnValueOnce(false);

    pause(instance);

    expect(mockSendMessage).not.toHaveBeenCalledWith({
      type: MessageType.PAUSE,
    });
  });
});
