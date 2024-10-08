import { logger } from '../../../utils/logger';
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
import { handleChannelConfig } from '../EventListeners/handleChannelConfig';
import { reconnectSocket } from '../ConnectionManager/reconnectSocket';
import { handleChannelRejected } from '../EventListeners/handleChannelRejected';

const channelEventListenerMap = [
  {
    event: EventType.CLIENTS_CONNECTED,
    handler: handleClientsConnected,
  },
  {
    event: EventType.CHANNEL_CREATED,
    handler: handleChannelCreated,
  },
  {
    event: EventType.CLIENTS_DISCONNECTED,
    handler: handlesClientsDisconnected,
  },
  { event: EventType.CONFIG, handler: handleChannelConfig },
  { event: EventType.MESSAGE, handler: handleMessage },
  { event: EventType.REJECTED, handler: handleChannelRejected },
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
  logger.SocketService(
    `[SocketService: setupChannelListener()] context=${instance.state.context} setting socket listeners for channel ${channelId}...`,
  );

  const { socket } = instance.state;
  const { keyExchange } = instance.state;

  // Only available for the originator -- used for connection recovery
  if (socket && instance.state.isOriginator) {
    if (instance.state.debug) {
      // TODO remove all the handleSocker* functions
      // They are not required since it is managed via the handleDisconnect function
      socket?.io.on('error', (error) => {
        logger.SocketService(
          `[SocketService: setupChannelListener()] context=${instance.state.context} socket event=error`,
          error,
        );
        // return handleSocketError(instance)(error);
      });

      socket?.io.on('reconnect', (attempt) => {
        logger.SocketService(
          `[SocketService: setupChannelListener()] context=${instance.state.context} socket event=reconnect`,
          attempt,
        );

        reconnectSocket(instance).catch((_e) => {
          // error handled in reconnectSocket
        });
      });

      socket?.io.on('reconnect_error', (error) => {
        logger.SocketService(
          `[SocketService: setupChannelListener()] context=${instance.state.context} socket event=reconnect_error`,
          error,
        );
        // return handleReconnectError(instance)(error);
      });

      socket?.io.on('reconnect_failed', () => {
        logger.SocketService(
          `[SocketService: setupChannelListener()] context=${instance.state.context} socket event=reconnect_failed`,
        );
        // return handleReconnectFailed(instance)();
      });

      // Keep commented for now, only useful during development
      // socket?.io.on('ping', () => {
      //   logger.SocketService(
      //     `[SocketService: setupChannelListener()] 'ping' context=${instance.state.context} socket`,
      //   );
      //   // return handlePing(instance)();
      // });
    }

    socket?.on('disconnect', (reason: string) => {
      logger.SocketService(
        `[SocketService: setupChannelListener()] on 'disconnect' -- MetaMaskSDK socket disconnected '${reason}' begin recovery...`,
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
