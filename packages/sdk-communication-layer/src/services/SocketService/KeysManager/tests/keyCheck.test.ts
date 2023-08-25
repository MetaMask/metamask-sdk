import { keyCheck } from '../keyCheck';
import { SocketService } from '../../../../SocketService';
import { KeyExchangeMessageType } from '../../../../types/KeyExchangeMessageType';
import { EventType } from '../../../../types/EventType';

describe('keyCheck', () => {
  let instance: SocketService;
  const mockEmit = jest.fn();
  const mockGetKeyInfo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        socket: {
          emit: mockEmit,
        },
        channelId: 'testChannelId',
        context: 'testContext',
      },
      getKeyInfo: mockGetKeyInfo,
    } as unknown as SocketService;

    mockGetKeyInfo.mockReturnValue({
      ecies: {
        otherPubKey: 'testPublicKey',
      },
    });
  });

  it('should emit a KEY_HANDSHAKE_CHECK message with the correct structure', () => {
    keyCheck(instance);

    expect(mockEmit).toHaveBeenCalledWith(EventType.MESSAGE, {
      id: instance.state.channelId,
      context: instance.state.context,
      message: {
        type: KeyExchangeMessageType.KEY_HANDSHAKE_CHECK,
        pubkey: 'testPublicKey',
      },
    });
  });

  it('should fetch the other public key using getKeyInfo method', () => {
    keyCheck(instance);

    expect(mockGetKeyInfo).toHaveBeenCalled();
  });
});
