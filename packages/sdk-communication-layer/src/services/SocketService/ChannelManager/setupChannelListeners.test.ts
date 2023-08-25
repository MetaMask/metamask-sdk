import { Socket } from 'socket.io-client';
import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { KeyExchange } from '../../../KeyExchange';
import { setupChannelListeners } from './setupChannelListeners';

describe('setupChannelListeners', () => {
  let instance: SocketService;
  let socket: Partial<Socket>;
  let keyExchange: Partial<KeyExchange>;

  const socketEvents = [
    'error',
    'ping',
    'reconnect',
    'reconnect_error',
    'reconnect_failed',
    'disconnect',
  ];
  const channelEvents = [
    'clients_connected',
    'channel_created',
    'clients_disconnected',
    'message',
    'clients_waiting_to_join',
  ];
  const keyExchangeEvents = [EventType.KEY_INFO, EventType.KEYS_EXCHANGED]; // Adjust with the exact number of events in keyExchangeEventListenerMap

  beforeEach(() => {
    socket = { on: jest.fn() };
    keyExchange = { on: jest.fn() };

    instance = {
      state: {
        debug: false,
        socket,
        context: 'testContext',
        keyExchange,
      },
    } as unknown as SocketService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should setup socket event listeners with correct names', () => {
    setupChannelListeners(instance, 'testChannelId');

    socketEvents.forEach((event) => {
      expect(socket.on).toHaveBeenCalledWith(
        `${event}-testChannelId`,
        expect.any(Function),
      );
    });
  });

  it('should setup channel event listeners with correct names', () => {
    setupChannelListeners(instance, 'testChannelId');

    channelEvents.forEach((event) => {
      expect(socket.on).toHaveBeenCalledWith(
        `${event}-testChannelId`,
        expect.any(Function),
      );
    });
  });

  it('should setup key exchange event listeners', () => {
    setupChannelListeners(instance, 'testChannelId');

    keyExchangeEvents.forEach((event) => {
      expect(keyExchange.on).toHaveBeenCalledWith(event, expect.any(Function));
    });
  });
});
