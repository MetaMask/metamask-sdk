import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import {
  handleSocketError,
  handlePing,
  handleReconnect,
  handleReconnectError,
  handleReconnectFailed,
  handleDisconnect,
  handleClientsConnected,
  handleChannelCreated,
  handlesClientsDisconnected,
  handleMessage,
  handleClientsWaitingToJoin,
  handleKeyInfo,
  handleKeysExchanged,
} from '../EventListeners';

const socketEventListenerMap = [
  { event: 'error', handler: handleSocketError },
  { event: 'ping', handler: handlePing },
  { event: 'reconnect', handler: handleReconnect },
  {
    event: 'reconnect_error',
    handler: handleReconnectError,
  },
  {
    event: 'reconnect_failed',
    handler: handleReconnectFailed,
  },
  { event: 'disconnect', handler: handleDisconnect },
];

const channelEventListenerMap = [
  {
    event: 'clients_connected',
    handler: handleClientsConnected,
  },
  {
    event: 'channel_created',
    handler: handleChannelCreated,
  },
  {
    event: 'clients_disconnected',
    handler: handlesClientsDisconnected,
  },
  { event: 'message', handler: handleMessage },
  {
    event: 'clients_waiting_to_join',
    handler: handleClientsWaitingToJoin,
  },
];

const keyExchangeEventListenerMap = [
  {
    event: EventType.KEY_INFO,
    handler: handleKeyInfo,
  },
  {
    event: EventType.KEYS_EXCHANGED,
    handler: handleKeysExchanged,
  },
];

/**
 * Sets up event listeners for a SocketService instance associated with a specific channel.
 * If debugging is enabled, a debug message is logged indicating the setup process.
 * Event listeners are added to the socket for events defined in the
 * `socketEventListenerMap`, `channelEventListenerMap`, and `keyExchangeEventListenerMap`.
 *
 * @param instance The current instance of the SocketService.
 * @param channelId The ID of the channel associated with the listeners.
 */
export function setupChannelListeners(
  instance: SocketService,
  channelId: string,
) {
  if (instance.state.debug) {
    console.debug(
      `SocketService::${instance.state.context}::setupChannelListener setting socket listeners for channel ${channelId}...`,
    );
  }

  const { socket } = instance.state;
  const { keyExchange } = instance.state;

  socketEventListenerMap.forEach(({ event, handler }) => {
    socket?.io.on(event as any, handler(instance));
  });

  channelEventListenerMap.forEach(({ event, handler }) => {
    const fullEventName = `${event}-${channelId}`;
    socket?.on(fullEventName, handler(instance, channelId));
  });

  keyExchangeEventListenerMap.forEach(({ event, handler }) => {
    keyExchange?.on(event, handler(instance));
  });
}
