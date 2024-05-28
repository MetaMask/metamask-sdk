import { SocketService } from '../../../SocketService';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { MessageType } from '../../../types/MessageType';
import { logger } from '../../../utils/logger';
import { encryptAndSendMessage } from './encryptAndSendMessage';

describe('encryptAndSendMessage', () => {
  let instance: SocketService;

  const spyLogger = jest.spyOn(logger, 'SocketService');

  const mockEncryptMessage = jest.fn();
  const mockEmit = jest.fn();

  const testMessage: CommunicationLayerMessage = {
    type: MessageType.PAUSE,
    data: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
        context: 'testContext',
        channelId: '123',
        hasPlaintext: false,
        keyExchange: {
          encryptMessage: mockEncryptMessage,
        },
        socket: {
          emit: mockEmit,
        },
      },
      remote: { state: {} },
    } as unknown as SocketService;

    mockEncryptMessage.mockReturnValue('encryptedMessage');
  });

  it('should encrypt and send the message', () => {
    encryptAndSendMessage(instance, testMessage);
    expect(mockEncryptMessage).toHaveBeenCalledWith(
      JSON.stringify(testMessage),
    );

    expect(mockEmit).toHaveBeenCalledWith(
      'message',
      expect.objectContaining({
        id: '123',
        context: 'testContext',
        message: 'encryptedMessage',
      }),
    );
  });

  it('should include plaintext if hasPlaintext is true', () => {
    instance.state.hasPlaintext = true;
    encryptAndSendMessage(instance, testMessage);
    expect(mockEmit).toHaveBeenCalledWith(
      'message',
      expect.objectContaining({
        plaintext: JSON.stringify(testMessage),
      }),
    );
  });

  it('should log debug info', () => {
    encryptAndSendMessage(instance, testMessage);

    expect(spyLogger).toHaveBeenCalled();
  });

  it('should set manualDisconnect if message type is TERMINATE', () => {
    const terminateMessage: CommunicationLayerMessage = {
      type: MessageType.TERMINATE,
      data: {},
    };
    encryptAndSendMessage(instance, terminateMessage);
    expect(instance.state.manualDisconnect).toBe(true);
  });
});
