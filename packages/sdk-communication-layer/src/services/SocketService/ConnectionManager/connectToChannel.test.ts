import { Socket } from 'socket.io-client';
import { SocketService } from '../../../SocketService';
import { logger } from '../../../utils/logger';
import { setupChannelListeners } from '../ChannelManager';
import { EventType } from '../../../types/EventType';
import { connectToChannel } from './connectToChannel';

jest.mock('../ChannelManager');
jest.mock('../../../utils/logger');

describe('connectToChannel', () => {
  let instance: SocketService;
  let mockSocket: jest.Mocked<Socket>;
  let originalConsoleError: typeof console.error;

  const spyLogger = jest.spyOn(logger, 'SocketService');
  const mockConsoleError = jest.fn();
  const mockConsoleLog = jest
    .spyOn(console, 'log')
    .mockImplementation(() => '');

  beforeEach(() => {
    jest.clearAllMocks();
    originalConsoleError = console.error;
    console.error = mockConsoleError;

    mockSocket = {
      connected: false,
      connect: jest.fn(),
      emit: jest.fn(),
    } as unknown as jest.Mocked<Socket>;

    instance = {
      state: {
        debug: false,
        isOriginator: true,
        socket: mockSocket,
        context: 'someContext',
        keyExchange: {
          toString: jest.fn(() => 'keyExchangeString'),
          getKeyInfo: jest.fn(() => ({ ecies: { public: 'mockPublicKey' } })),
          setKeysExchanged: jest.fn(),
        },
      },
      remote: {
        state: {},
        emit: jest.fn(),
      },
      emit: jest.fn(),
    } as unknown as SocketService;
  });

  afterEach(() => {
    console.error = originalConsoleError;
    mockConsoleLog.mockRestore();
  });

  it('should connect to channel successfully', async () => {
    const options = {
      channelId: 'channel123',
      withKeyExchange: true,
      authorized: false,
    };

    (instance.state.socket?.emit as jest.Mock).mockImplementation(
      (_event: string, _data: any, callback: any) => {
        callback(null, { ready: true });
      },
    );

    await connectToChannel({ options, instance });

    expect(mockSocket.connect).toHaveBeenCalled();
    expect(instance.state.withKeyExchange).toBe(true);
    expect(instance.state.isOriginator).toBe(true);
    expect(instance.state.channelId).toBe('channel123');
    expect(setupChannelListeners).toHaveBeenCalledWith(instance, 'channel123');
    expect(mockSocket.emit).toHaveBeenCalledWith(
      EventType.JOIN_CHANNEL,
      expect.objectContaining({
        channelId: 'channel123',
        context: 'someContext_connectToChannel',
        clientType: 'dapp',
      }),
      expect.any(Function),
    );
  });

  it('should throw error if socket is already connected', async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    instance.state.socket!.connected = true;

    const options = {
      channelId: 'channel123',
      withKeyExchange: true,
      authorized: false,
    };

    await expect(connectToChannel({ options, instance })).rejects.toThrow(
      'socket already connected',
    );

    expect(mockConsoleError).toHaveBeenCalledWith(
      '[SocketService: connectToChannel()] socket already connected',
    );
  });

  it('should log debug information', async () => {
    const options = {
      channelId: 'channel123',
      withKeyExchange: true,
      authorized: false,
    };

    (instance.state.socket?.emit as jest.Mock).mockImplementation(
      (_event: string, _data: any, callback: any) => {
        callback(null, { ready: true });
      },
    );

    await connectToChannel({ options, instance });

    expect(spyLogger).toHaveBeenCalledWith(
      '[SocketService: connectToChannel()] context=someContext channelId=channel123 isOriginator=true',
      'keyExchangeString',
    );
  });
});
