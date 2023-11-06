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

  if (instance.state.setupChannelListeners) {
    console.warn(
      `SocketService::${instance.state.context}::setupChannelListener socket listeners already set up for channel ${channelId}`,
    );
  }

  // Only available for the originator -- used for connection recovery
  if (socket && instance.state.isOriginator) {
    if (instance.state.debug) {
      // TODO remove all the handleSocker* functions
      // They are not required since it is managed via the handleDisconnect function
      socket?.io.on('error', (error) => {
        console.debug(
          `SocketService::${instance.state.context}::setupChannelListener socket event=error`,
          error,
        );
        // return handleSocketError(instance)(error);
      });

      socket?.io.on('reconnect', (attempt) => {
        console.debug(
          `SocketService::${instance.state.context}::setupChannelListener socket event=reconnect`,
          attempt,
        );
      });

      socket?.io.on('reconnect_error', (error) => {
        console.debug(
          `SocketService::${instance.state.context}::setupChannelListener socket event=reconnect_error`,
          error,
        );
        // return handleReconnectError(instance)(error);
      });

      socket?.io.on('reconnect_failed', () => {
        console.debug(
          `SocketService::${instance.state.context}::setupChannelListener socket event=reconnect_failed`,
        );
        // return handleReconnectFailed(instance)();
      });

      socket?.io.on('ping', () => {
        console.debug(
          `SocketService::${instance.state.context}::setupChannelListener socket event=ping`,
        );
        // return handlePing(instance)();
      });
    }

    socket?.on('disconnect', (reason: string) => {
      console.log(
        `MetaMaskSDK socket disconnected '${reason}' begin recovery...`,
      );
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

  instance.state.setupChannelListeners = true;
}
