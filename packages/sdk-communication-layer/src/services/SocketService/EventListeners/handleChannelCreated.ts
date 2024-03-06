import { logger } from '../../../utils/logger';
import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';

/**
 * Returns a handler function to handle the 'channel_created' event for a specific channel.
 * This handler emits a CHANNEL_CREATED event using the provided SocketService instance and ID.
 *
 * @param instance The current instance of the SocketService.
 * @param channelId The ID of the channel associated with the handler.
 * @returns {Function} A handler function for the 'channel_created' event.
 */
export function handleChannelCreated(
  instance: SocketService,
  channelId: string,
) {
  return (id: string) => {
    logger.SocketService(
      `[SocketService: handleChannelCreated()] context=${instance.state.context} on 'channel_created-${channelId}'`,
      id,
    );
    instance.emit(EventType.CHANNEL_CREATED, id);
  };
}
