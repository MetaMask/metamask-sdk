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

    mockEmit.mockImplementation((_event, _message, callback) => {
      // Simulate async behavior
      setTimeout(() => {
        callback(null, { success: true });
      }, 0);
    });

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

  it('should encrypt and send the message', async () => {
    const result = await encryptAndSendMessage(instance, testMessage);
    expect(result).toBe(true);
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
      expect.any(Function),
    );
  });

  it('should handle emit errors', async () => {
    mockEmit.mockImplementation((_event, _message, callback) => {
      setTimeout(() => {
        callback(new Error('Emit error'));
      }, 0);
    });

    await expect(encryptAndSendMessage(instance, testMessage)).rejects.toThrow(
      'Emit error',
    );
  });

  it('should include plaintext if hasPlaintext is true', async () => {
    instance.state.hasPlaintext = true;
    await encryptAndSendMessage(instance, testMessage);
    expect(mockEmit).toHaveBeenCalledWith(
      'message',
      expect.objectContaining({
        clientType: 'wallet',
        context: 'testContext',
        id: '123',
        message: 'encryptedMessage',
        plaintext: JSON.stringify(testMessage),
      }),
      expect.any(Function),
    );
  });

  it('should log debug info', async () => {
    await encryptAndSendMessage(instance, testMessage);

    expect(spyLogger).toHaveBeenCalled();
  });

  it('should set manualDisconnect if message type is TERMINATE', async () => {
    const terminateMessage: CommunicationLayerMessage = {
      type: MessageType.TERMINATE,
      data: {},
    };
    await encryptAndSendMessage(instance, terminateMessage);
    expect(instance.state.manualDisconnect).toBe(true);
  });
});
