import { logger } from '../../../utils/logger';
import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';

/**
 * Returns a handler function to handle the 'clients_waiting_to_join' event for a specific channel.
 * This handler emits a CLIENTS_WAITING event with the number of waiting users.
 *
 * @param instance The current instance of the SocketService.
 * @param channelId The ID of the channel associated with the handler.
 * @returns {Function} A handler function for the 'clients_waiting_to_join' event.
 */
export function handleClientsWaitingToJoin(
  instance: SocketService,
  channelId: string,
) {
  return (numberUsers: number) => {
    logger.SocketService(
      `[SocketService: handleClientsWaitingToJoin()] context=${instance.state.context} on 'clients_waiting_to_join-${channelId}'`,
      numberUsers,
    );

    instance.emit(EventType.CLIENTS_WAITING, numberUsers);
  };
}
