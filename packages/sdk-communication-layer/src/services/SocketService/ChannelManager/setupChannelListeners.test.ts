import { Socket } from 'socket.io-client';
import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { KeyExchange } from '../../../KeyExchange';
import { setupChannelListeners } from './setupChannelListeners';

describe('setupChannelListeners', () => {
  let instance: SocketService;
  let socket: jest.Mocked<Partial<Socket>>;
  let keyExchange: jest.Mocked<Partial<KeyExchange>>;

  const channelEvents = [
    'clients_connected',
    'channel_created',
    'clients_disconnected',
    'message',
    'clients_waiting_to_join',
  ];
  const keyExchangeEvents = [EventType.KEY_INFO, EventType.KEYS_EXCHANGED]; // Adjust with the exact number of events in keyExchangeEventListenerMap

  beforeEach(() => {
    socket = { on: jest.fn(), io: { on: jest.fn() } as any }; // Cast to any
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
