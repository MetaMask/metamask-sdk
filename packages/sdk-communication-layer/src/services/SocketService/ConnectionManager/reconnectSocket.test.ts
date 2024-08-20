import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { wait } from '../../../utils/wait';
import { logger } from '../../../utils/logger';
import { MessageType } from '../../../types/MessageType';
import { reconnectSocket } from './reconnectSocket';

jest.mock('../../../utils/wait', () => ({
  wait: jest.fn(),
}));

describe('reconnectSocket', () => {
  let instance: SocketService;
  const mockConnect = jest.fn();
  const mockEmitInstance = jest.fn();
  const mockEmitSocket = jest.fn();

  const spyLogger = jest.spyOn(logger, 'SocketService');

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
        context: 'someContext',
        channelId: 'sampleChannelId',
        isOriginator: false,
        socket: {
          connected: false,
          connect: mockConnect,
          emit: mockEmitSocket,
        },
      },
      remote: { state: {} },
      emit: mockEmitInstance,
    } as unknown as SocketService;

    (wait as jest.Mock).mockResolvedValue(undefined);
  });

  it('should log debug information', async () => {
    await reconnectSocket(instance);

    expect(spyLogger).toHaveBeenCalledWith(
      '[SocketService: reconnectSocket()] connected=false trying to reconnect after socketio disconnection',
      instance,
    );
  });

  it('should wait for a brief delay', async () => {
    await reconnectSocket(instance);

    expect(wait).toHaveBeenCalledWith(200);
  });

  it('should reconnect the socket and emit events if not already connected', async () => {
    await reconnectSocket(instance);

    expect(mockConnect).toHaveBeenCalled();
    expect(mockEmitInstance).toHaveBeenCalledWith(EventType.SOCKET_RECONNECT);
    expect(mockEmitSocket).toHaveBeenCalledWith(
      EventType.JOIN_CHANNEL,
      {
        channelId: 'sampleChannelId',
        context: 'someContextconnect_again',
        clientType: 'wallet',
      },
      expect.any(Function),
    );
  });

  it('should not reconnect but emit PING if socket is already connected', async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    instance.state.socket!.connected = true;

    await reconnectSocket(instance);

    expect(mockConnect).not.toHaveBeenCalled();
    expect(mockEmitInstance).not.toHaveBeenCalled();
    expect(mockEmitSocket).toHaveBeenCalledWith(MessageType.PING, {
      id: 'sampleChannelId',
      clientType: 'wallet',
      context: 'on_channel_config',
      message: '',
    });
  });
});
