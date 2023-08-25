/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { wait } from '../../../utils/wait';
import { reconnectSocket } from './reconnectSocket';

jest.mock('../../../utils/wait', () => ({
  wait: jest.fn(),
}));

describe('reconnectSocket', () => {
  let instance: SocketService;
  const mockConnect = jest.fn();
  const mockEmitInstance = jest.fn();
  const mockEmitSocket = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
        context: 'someContext',
        channelId: 'sampleChannelId',
        socket: {
          connected: false,
          connect: mockConnect,
          emit: mockEmitSocket,
        },
      },
      emit: mockEmitInstance,
    } as unknown as SocketService;

    (wait as jest.Mock).mockResolvedValue(undefined);
  });

  it('should log debug information when debugging is enabled', async () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    instance.state.debug = true;

    await reconnectSocket(instance);

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      expect.stringContaining('SocketService::connectAgain'),
      instance,
    );

    consoleDebugSpy.mockRestore();
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
      'sampleChannelId',
      'someContextconnect_again',
    );
  });

  it('should not reconnect or emit events if socket is already connected', async () => {
    instance.state.socket!.connected = true;

    await reconnectSocket(instance);

    expect(mockConnect).not.toHaveBeenCalled();
    expect(mockEmitInstance).not.toHaveBeenCalled();
    expect(mockEmitSocket).not.toHaveBeenCalled();
  });
});
