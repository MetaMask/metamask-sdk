import { SocketService } from '../../../SocketService';
/**
 * Returns a handler function to handle the 'channel_created' event for a specific channel.
 * This handler emits a CHANNEL_CREATED event using the provided SocketService instance and ID.
 *
 * @param instance The current instance of the SocketService.
 * @param channelId The ID of the channel associated with the handler.
 * @returns {Function} A handler function for the 'channel_created' event.
 */
export declare function handleChannelCreated(instance: SocketService, channelId: string): (id: string) => void;
//# sourceMappingURL=handleChannelCreated.d.ts.map