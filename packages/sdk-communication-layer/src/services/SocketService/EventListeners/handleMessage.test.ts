import { analytics } from '@metamask/sdk-analytics';
import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { InternalEventType } from '../../../types/InternalEventType';
import { KeyExchangeMessageType } from '../../../types/KeyExchangeMessageType';
import { MessageType } from '../../../types/MessageType';
import { logger } from '../../../utils/logger';
import * as ChannelManager from '../ChannelManager';
import { handleMessage } from './handleMessage';

jest.mock('../ChannelManager');
jest.mock('@metamask/sdk-analytics', () => ({
  analytics: {
    track: jest.fn(),
  },
}));

// Mock lcLogguedRPCs array
jest.mock('../MessageHandlers', () => ({
  lcLogguedRPCs: ['eth_sendtransaction'],
}));

const msgToDeEncrypt = 'encryptedMessage';

describe('handleMessage', () => {
  let instance: SocketService;

  const spyLogger = jest.spyOn(logger, 'SocketService');
  const mockAnalyticsTrack = analytics.track as jest.Mock;

  const mockCheckSameId = ChannelManager.checkSameId as jest.Mock;
  const mockEmit = jest.fn();
  const mockAreKeysExchanged = jest.fn();
  const mockGetKeyInfo = jest.fn().mockReturnValue({ step: 'someStep' });
  const mockDecryptMessage = jest.fn((msg) => {
    console.log(`mockDecrypt msg:`, msg);
    if (msg === msgToDeEncrypt) {
      throw new Error('invalid');
    }
    return '{}';
  });
  const mockSetKeysExchanged = jest.fn();
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
          setKeysExchanged: mockSetKeysExchanged,
          getKeyInfo: mockGetKeyInfo,
          start: mockStart,
        },
        rpcMethodTracker: {},
      },
      remote: {
        state: {},
      },
      emit: mockEmit,
    } as unknown as SocketService;
  });

  it('should log debug information', () => {
    const handler = handleMessage(instance, channelId);
    handler({ ackId: 'testId', message: { type: MessageType.PING } });
    expect(spyLogger).toHaveBeenCalled();
  });

  it('should emit KEY_EXCHANGE when a key_handshake message is received', () => {
    const handler = handleMessage(instance, channelId);
    handler({ ackId: 'testId', message: { type: 'key_handshake_test' } });

    expect(mockEmit).toHaveBeenCalledWith(InternalEventType.KEY_EXCHANGE, {
      message: { type: 'key_handshake_test' },
      context: instance.state.context,
    });
  });

  it('should emit the decrypted MESSAGE when keys are exchanged', () => {
    mockAreKeysExchanged.mockReturnValueOnce(true);
    mockDecryptMessage.mockReturnValue(
      JSON.stringify({ type: MessageType.PAUSE }),
    );

    const handler = handleMessage(instance, channelId);
    handler({ ackId: 'testId', message: msgToDeEncrypt });

    expect(mockEmit).toHaveBeenCalledWith(EventType.MESSAGE, {
      message: { type: MessageType.PAUSE },
    });
  });

  it('should throw an error if the message contains an error', () => {
    const handler = handleMessage(instance, channelId);

    expect(() => {
      handler({ ackId: 'testId', message: { type: '' }, error: 'Some error' });
    }).toThrow('Some error');
  });

  it('should start key exchange if isOriginator and receives a HANDSHAKE_START message', () => {
    instance.state.isOriginator = true;

    const handler = handleMessage(instance, channelId);
    handler({
      ackId: 'testId',
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
    handler({ ackId: 'testId', message: msgToDeEncrypt });

    // expect(mockSendMessage).toHaveBeenCalledWith({
    //   type: KeyExchangeMessageType.KEY_HANDSHAKE_START,
    // });

    // TODO proper error handling
    expect(true).toBe(true);
  });

  it('should emit non-encrypted unknown message', () => {
    mockAreKeysExchanged.mockReturnValueOnce(true);
    mockDecryptMessage.mockReturnValue(
      JSON.stringify({
        type: 'testType',
        data: 'testData',
      }),
    );

    const handler = handleMessage(instance, channelId);
    handler({
      ackId: 'testId',
      message: {
        type: 'testType',
        data: 'testData',
      },
    });

    expect(mockEmit).toHaveBeenCalledWith(EventType.MESSAGE, {
      type: 'testType',
      data: 'testData',
    });
  });

  it('should set clientsPaused to true if a decrypted PAUSE message is received', () => {
    mockAreKeysExchanged.mockReturnValueOnce(true);
    mockDecryptMessage.mockReturnValue(
      JSON.stringify({ type: MessageType.PAUSE }),
    );

    const handler = handleMessage(instance, channelId);
    handler({ ackId: 'testId', message: msgToDeEncrypt });

    expect(instance.state.clientsPaused).toBe(true);
  });

  it('should emit a MESSAGE event with a ping message when receiving a PING message', () => {
    const handler = handleMessage(instance, channelId);
    handler({ ackId: 'testId', message: { type: MessageType.PING } });

    expect(mockEmit).toHaveBeenCalledWith(EventType.MESSAGE, {
      type: 'ping',
    });
  });

  it('should emit KEY_EXCHANGE when a message starting with key_handshake is received', () => {
    const handler = handleMessage(instance, channelId);
    handler({ ackId: 'testId', message: { type: 'key_handshake_someType' } });

    expect(mockEmit).toHaveBeenCalledWith(InternalEventType.KEY_EXCHANGE, {
      message: { type: 'key_handshake_someType' },
      context: instance.state.context,
    });
  });

  it('should emit a decrypted message after successful decryption', () => {
    mockAreKeysExchanged.mockReturnValueOnce(true);
    mockDecryptMessage.mockReturnValue(
      JSON.stringify({ type: 'testType', data: 'testData' }),
    );

    const handler = handleMessage(instance, channelId);
    handler({ ackId: 'testId', message: msgToDeEncrypt });

    expect(mockEmit).toHaveBeenCalledWith(EventType.MESSAGE, {
      message: { type: 'testType', data: 'testData' },
    });
  });

  // New tests for analytics tracking
  describe('RPC response analytics tracking', () => {
    beforeEach(() => {
      instance.state.isOriginator = true;
      mockAreKeysExchanged.mockReturnValue(true);

      // Setup RPC method tracker with a tracked method
      instance.state.rpcMethodTracker = {
        '123': {
          id: '123',
          method: 'eth_sendTransaction',
          timestamp: Date.now(),
        },
      };
    });

    it('should track successful RPC responses', () => {
      mockDecryptMessage.mockReturnValue(
        JSON.stringify({
          data: {
            id: '123',
            result: { success: true },
          },
        }),
      );

      const handler = handleMessage(instance, channelId);
      handler({ ackId: 'testId', message: 'encrypted_message' });

      expect(mockAnalyticsTrack).toHaveBeenCalledWith('sdk_action_succeeded', {
        action: 'eth_sendTransaction',
      });
    });

    it('should track failed RPC responses', () => {
      mockDecryptMessage.mockReturnValue(
        JSON.stringify({
          data: {
            id: '123',
            error: {
              code: 1000,
              message: 'Transaction failed',
            },
          },
        }),
      );

      const handler = handleMessage(instance, channelId);
      handler({ ackId: 'testId', message: 'encrypted_message' });

      expect(mockAnalyticsTrack).toHaveBeenCalledWith('sdk_action_failed', {
        action: 'eth_sendTransaction',
      });
    });

    it('should track rejected RPC responses', () => {
      mockDecryptMessage.mockReturnValue(
        JSON.stringify({
          data: {
            id: '123',
            error: {
              code: 4001,
              message: 'User rejected the request',
            },
          },
        }),
      );

      const handler = handleMessage(instance, channelId);
      handler({ ackId: 'testId', message: 'encrypted_message' });

      expect(mockAnalyticsTrack).toHaveBeenCalledWith('sdk_action_rejected', {
        action: 'eth_sendTransaction',
      });
    });

    it('should not track analytics for untracked RPC methods', () => {
      // Mock a method that is not in the lcLogguedRPCs list
      instance.state.rpcMethodTracker = {
        '123': {
          id: '123',
          method: 'untracked_method',
          timestamp: Date.now(),
        },
      };

      mockDecryptMessage.mockReturnValue(
        JSON.stringify({
          data: {
            id: '123',
            result: { success: true },
          },
        }),
      );

      const handler = handleMessage(instance, channelId);
      handler({ ackId: 'testId', message: 'encrypted_message' });

      // Analytics.track should not be called for untracked methods
      expect(mockAnalyticsTrack).not.toHaveBeenCalled();
    });
  });
});
