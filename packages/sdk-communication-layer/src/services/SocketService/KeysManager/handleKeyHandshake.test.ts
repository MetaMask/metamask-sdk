import { SocketService } from '../../../SocketService';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { EventType } from '../../../types/EventType';
import { KeyExchangeMessageType } from '../../../types/KeyExchangeMessageType';
import { logger } from '../../../utils/logger';
import { handleKeyHandshake } from './handleKeyHandshake';

describe('handleKeyHandshake', () => {
  let instance: SocketService;

  const spyLogger = jest.spyOn(logger, 'SocketService');
  const mockEmit = jest.fn();

  const keyHandshakeMessage: CommunicationLayerMessage = {
    type: KeyExchangeMessageType.KEY_HANDSHAKE_START,
    data: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
        context: 'testContext',
        channelId: 'testChannelId',
        socket: {
          emit: mockEmit,
        },
      },
    } as unknown as SocketService;
  });

  it('should log the message', () => {
    handleKeyHandshake(instance, keyHandshakeMessage);

    expect(spyLogger).toHaveBeenCalledWith(
      '[SocketService: handleKeyHandshake()] context=testContext',
      keyHandshakeMessage,
    );
  });

  it('should send a key handshake message without encryption', () => {
    handleKeyHandshake(instance, keyHandshakeMessage);

    expect(mockEmit).toHaveBeenCalledWith(EventType.MESSAGE, {
      id: instance.state.channelId,
      context: instance.state.context,
      message: keyHandshakeMessage,
    });
  });
});
