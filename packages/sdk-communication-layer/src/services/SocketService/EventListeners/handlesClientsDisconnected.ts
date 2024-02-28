import { loggerServiceLayer } from '../../../utils/logger';
import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';

/**
 * Returns a handler function to handle the 'clients_disconnected' event.
 * This handler updates the clientsConnected state to false, and if the instance is the originator
 * and clients are not paused, it cleans the key exchange.
 * It also emits the CLIENTS_DISCONNECTED event.
 *
 * @param instance The current instance of the SocketService.
 * @param channelId The ID of the channel.
 * @returns {Function} A handler function for the 'clients_disconnected' event.
 */
export function handlesClientsDisconnected(
  instance: SocketService,
  channelId: string,
) {
  return () => {
    instance.state.clientsConnected = false;
    loggerServiceLayer(
      `[SocketService: handlesClientsDisconnected()] context=${instance.state.context} on 'clients_disconnected-${channelId}'`,
    );

    if (instance.state.isOriginator && !instance.state.clientsPaused) {
      // If it wasn't paused - need to reset keys.
      instance.state.keyExchange?.clean();
    }

    instance.emit(EventType.CLIENTS_DISCONNECTED, channelId);
  };
}
