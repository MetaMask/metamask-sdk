import { RemoteCommunication } from '../../../RemoteCommunication';
/**
 * Creates and returns an event handler function for the "CHANNEL_CREATED" event. This handler function manages the channel creation process for a given RemoteCommunication instance.
 *
 * Upon receiving the "CHANNEL_CREATED" event:
 * 1. If debugging is enabled, the event details are logged for diagnostics.
 * 2. The "CHANNEL_CREATED" event is emitted, passing along the channel ID, to inform other parts of the system that a channel has been successfully created.
 *
 * @param instance The instance of RemoteCommunication to be processed.
 * @returns A function which acts as the event handler for the "CHANNEL_CREATED" event.
 */
export declare function handleChannelCreatedEvent(instance: RemoteCommunication): (id: string) => void;
//# sourceMappingURL=handleChannelCreatedEvent.d.ts.map