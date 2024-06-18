/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SocketService } from '../../../SocketService';
import { logger } from '../../../utils/logger';
import { setupChannelListeners } from '../ChannelManager';
import { connectToChannel } from './connectToChannel';

jest.mock('../ChannelManager');

const mockConnect = jest.fn();
const mockEmit = jest.fn();

describe('connectToChannel', () => {
  let instance: SocketService;

  const spyLogger = jest.spyOn(logger, 'SocketService');

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
        isOriginator: true,
        socket: {
          connected: false,
          connect: mockConnect,
          emit: mockEmit,
        },
        context: 'someContext',
        keyExchange: {
          toString: jest.fn(() => 'keyExchangeString'),
        },
      },
      remote: { state: {} },
    } as unknown as SocketService;
  });

  it('should connect to channel successfully', () => {
    const options = {
      channelId: 'channel123',
      withKeyExchange: true,
      isOriginator: true,
    };

    connectToChannel({ options, instance });

    expect(mockConnect).toHaveBeenCalled();
    expect(instance.state.withKeyExchange).toBe(true);
    expect(instance.state.isOriginator).toBe(true);
    expect(instance.state.channelId).toBe('channel123');
    expect(setupChannelListeners).toHaveBeenCalledWith(instance, 'channel123');
  });

  it('should throw error if socket is already connected', () => {
    instance.state.socket!.connected = true;

    const options = {
      channelId: 'channel123',
      withKeyExchange: true,
      isOriginator: true,
    };

    expect(() => {
      connectToChannel({ options, instance });
    }).toThrow('socket already connected');
  });

  it('should log debug information', () => {
    const options = {
      channelId: 'channel123',
      withKeyExchange: true,
      isOriginator: true,
    };

    connectToChannel({ options, instance });

    expect(spyLogger).toHaveBeenCalledWith(
      '[SocketService: connectToChannel()] context=someContext channelId=channel123 isOriginator=true',
      'keyExchangeString',
    );
  });
});
