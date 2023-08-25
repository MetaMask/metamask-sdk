import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { InternalEventType } from '../../../types/InternalEventType';
import { KeyExchangeMessageType } from '../../../types/KeyExchangeMessageType';
import { MessageType } from '../../../types/MessageType';
import * as ChannelManager from '../ChannelManager';
import { handleMessage } from './handleMessage';

jest.mock('../ChannelManager');

describe('handleMessage', () => {
  let instance: SocketService;

  const mockCheckSameId = ChannelManager.checkSameId as jest.Mock;
  const mockEmit = jest.fn();
  const mockAreKeysExchanged = jest.fn();
  const mockDecryptMessage = jest.fn();
  const mockStart = jest.fn();
  const channelId = 'testChannel';

  beforeEach(() => {
    jest.clearAllMocks();

    mockCheckSameId.mockReturnValue(undefined);

    instance = {
      state: {
        debug: false,
        isOriginator: false,
        keyExchange: {
          areKeysExchanged: mockAreKeysExchanged,
          decryptMessage: mockDecryptMessage,
          start: mockStart,
        },
      },
      emit: mockEmit,
    } as unknown as SocketService;
  });

  it('should log debug information when debugging is enabled and the handler is called', () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    instance.state.debug = true;

    const handler = handleMessage(instance, channelId);
    handler({ id: 'testId', message: { type: MessageType.PING } });

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      `SocketService::${
        instance.state.context
      }::on 'message' ${channelId} keysExchanged=${instance.state.keyExchange?.areKeysExchanged()}`,
      { type: MessageType.PING },
    );

    consoleDebugSpy.mockRestore();
  });

  it('should emit MESSAGE event with ping type when a PING message is received', () => {
    const handler = handleMessage(instance, channelId);
    handler({ id: 'testId', message: { type: MessageType.PING } });

    expect(mockEmit).toHaveBeenCalledWith(EventType.MESSAGE, {
      message: { type: 'ping' },
    });
  });

  it('should emit KEY_EXCHANGE when a key_handshake message is received', () => {
    const handler = handleMessage(instance, channelId);
    handler({ id: 'testId', message: { type: 'key_handshake_test' } });

    expect(mockEmit).toHaveBeenCalledWith(InternalEventType.KEY_EXCHANGE, {
      message: { type: 'key_handshake_test' },
      context: instance.state.context,
    });
  });

  it('should emit the decrypted MESSAGE when keys are exchanged', () => {
    mockAreKeysExchanged.mockReturnValueOnce(true);
    mockDecryptMessage.mockReturnValueOnce(
      JSON.stringify({ type: MessageType.PAUSE }),
    );

    const handler = handleMessage(instance, channelId);
    handler({ id: 'testId', message: 'encryptedMessage' });

    expect(mockEmit).toHaveBeenCalledWith(EventType.MESSAGE, {
      message: { type: MessageType.PAUSE },
    });
  });

  it('should throw an error if the message contains an error', () => {
    const handler = handleMessage(instance, channelId);

    expect(() => {
      handler({ id: 'testId', message: {}, error: 'Some error' });
    }).toThrow('Some error');
  });

  it('should log an error if checkSameId throws an error', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockCheckSameId.mockImplementation(() => {
      throw new Error('Some error');
    });

    const handler = handleMessage(instance, channelId);
    handler({ id: 'testId', message: {} });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'ignore message --- wrong id ',
      {},
    );

    consoleErrorSpy.mockRestore();
  });

  it('should start key exchange if isOriginator and receives a HANDSHAKE_START message', () => {
    instance.state.isOriginator = true;

    const handler = handleMessage(instance, channelId);
    handler({
      id: 'testId',
      message: { type: KeyExchangeMessageType.KEY_HANDSHAKE_START },
    });

    expect(mockStart).toHaveBeenCalledWith({
      isOriginator: true,
      force: true,
    });
  });

  it('should request a new key exchange if an encrypted message is received before keys are exchanged and not an originator', () => {
    mockAreKeysExchanged.mockReturnValueOnce(false);
    instance.state.isOriginator = false;
    const mockSendMessage = jest.fn();
    instance.sendMessage = mockSendMessage;

    const handler = handleMessage(instance, channelId);
    handler({ id: 'testId', message: 'encryptedMessage' });

    expect(mockSendMessage).toHaveBeenCalledWith({
      type: KeyExchangeMessageType.KEY_HANDSHAKE_START,
    });
  });

  it('should emit non-encrypted unknown message', () => {
    mockAreKeysExchanged.mockReturnValueOnce(true);
    mockDecryptMessage.mockReturnValueOnce(
      JSON.stringify({
        type: 'testType',
        data: 'testData',
      }),
    );

    const handler = handleMessage(instance, channelId);
    handler({
      id: 'testId',
      message: {
        type: 'testType',
        data: 'testData',
      },
    });

    expect(mockEmit).toHaveBeenCalledWith(EventType.MESSAGE, {
      message: {
        type: 'testType',
        data: 'testData',
      },
    });
  });

  it('should set clientsPaused to true if a decrypted PAUSE message is received', () => {
    mockAreKeysExchanged.mockReturnValueOnce(true);
    mockDecryptMessage.mockReturnValueOnce(
      JSON.stringify({ type: MessageType.PAUSE }),
    );

    const handler = handleMessage(instance, channelId);
    handler({ id: 'testId', message: 'encryptedMessage' });

    expect(instance.state.clientsPaused).toBe(true);
  });

  it('should emit a MESSAGE event with a ping message when receiving a PING message', () => {
    const handler = handleMessage(instance, channelId);
    handler({ id: 'testId', message: { type: MessageType.PING } });

    expect(mockEmit).toHaveBeenCalledWith(EventType.MESSAGE, {
      message: { type: 'ping' },
    });
  });

  it('should emit KEY_EXCHANGE when a message starting with key_handshake is received', () => {
    const handler = handleMessage(instance, channelId);
    handler({ id: 'testId', message: { type: 'key_handshake_someType' } });

    expect(mockEmit).toHaveBeenCalledWith(InternalEventType.KEY_EXCHANGE, {
      message: { type: 'key_handshake_someType' },
      context: instance.state.context,
    });
  });

  it('should emit a decrypted message after successful decryption', () => {
    mockAreKeysExchanged.mockReturnValueOnce(true);
    mockDecryptMessage.mockReturnValueOnce(
      JSON.stringify({ type: 'testType', data: 'testData' }),
    );

    const handler = handleMessage(instance, channelId);
    handler({ id: 'testId', message: 'encryptedMessage' });

    expect(mockEmit).toHaveBeenCalledWith(EventType.MESSAGE, {
      message: { type: 'testType', data: 'testData' },
    });
  });

  it('should start key exchange if an encrypted message is received before keys are exchanged and is an originator', () => {
    mockAreKeysExchanged.mockReturnValueOnce(false);
    instance.state.isOriginator = true;

    const handler = handleMessage(instance, channelId);
    handler({ id: 'testId', message: 'encryptedMessage' });

    expect(mockStart).toHaveBeenCalledWith({
      isOriginator: true,
    });
  });
});
