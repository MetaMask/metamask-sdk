/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { setupChannelListeners } from '../ChannelManager';
import { EventType } from '../../../types/EventType';
import { SocketService } from '../../../SocketService';
import * as loggerModule from '../../../utils/logger';
import { connectToChannel } from './connectToChannel';

jest.mock('../ChannelManager');

const mockConnect = jest.fn();
const mockEmit = jest.fn();

describe('connectToChannel', () => {
  let instance: SocketService;

  const spyLogger = jest.spyOn(loggerModule, 'loggerServiceLayer');

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
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
    expect(mockEmit).toHaveBeenCalledWith(
      EventType.JOIN_CHANNEL,
      'channel123',
      'someContext_connectToChannel',
    );
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
