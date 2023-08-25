import { SocketService } from '../../../../SocketService';
import { CommunicationLayerMessage } from '../../../../types/CommunicationLayerMessage';
import { EventType } from '../../../../types/EventType';
import { KeyExchangeMessageType } from '../../../../types/KeyExchangeMessageType';
import { handleKeyHandshake } from '../handleKeyHandshake';

describe('handleKeyHandshake', () => {
  let instance: SocketService;
  const mockConsoleDebug = jest.fn();
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

    jest.spyOn(console, 'debug').mockImplementation(mockConsoleDebug);
  });

  it('should log the message when debugging is enabled', () => {
    instance.state.debug = true;

    handleKeyHandshake(instance, keyHandshakeMessage);

    expect(mockConsoleDebug).toHaveBeenCalledWith(
      `SocketService::${instance.state.context}::sendMessage()`,
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
