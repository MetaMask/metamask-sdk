import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import {
  handleChannelCreated,
  handleClientsConnected,
  handleClientsWaitingToJoin,
  handleDisconnect,
  handleKeyInfo,
  handleKeysExchanged,
  handleMessage,
  handlePing,
  handleReconnect,
  handleReconnectError,
  handleReconnectFailed,
  handleSocketError,
  handlesClientsDisconnected,
} from '../EventListeners';

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

  // Only available for the originator -- used for connection recovery
  if (socket && instance.state.isOriginator) {
    socket?.io.on('error', (error) => {
      console.warn(`socket event=error`, error);
      return handleSocketError(instance)(error);
    });

    socket?.io.on('reconnect', (attempt) => {
      console.warn(`socket event=reconnect`, instance);
      return handleReconnect(instance)(attempt);
    });

    socket?.io.on('reconnect_error', (error) => {
      console.warn(`socket event=reconnect_error`, instance);
      return handleReconnectError(instance)(error);
    });

    socket?.io.on('reconnect_failed', () => {
      console.warn(`socket event=reconnect_failed`, instance);
      return handleReconnectFailed(instance)();
    });

    socket?.io.on('ping', () => {
      console.warn(`socket event=ping`, instance);
      return handlePing(instance)();
    });

    socket?.on('disconnect', (reason: string) => {
      console.warn(`handle socket disconnect`, reason);
      return handleDisconnect(instance)(reason);
    });
  }

  channelEventListenerMap.forEach(({ event, handler }) => {
    const fullEventName = `${event}-${channelId}`;
    socket?.on(fullEventName, handler(instance, channelId));
  });

  keyExchangeEventListenerMap.forEach(({ event, handler }) => {
    keyExchange?.on(event, handler(instance));
  });
}
