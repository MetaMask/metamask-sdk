import { RemoteCommunication } from '../../../RemoteCommunication';
/**
 * Creates and returns an event handler function for the "socket_reconnect" event. This handler processes socket reconnection events for a `RemoteCommunication` instance, updating its internal state and performing necessary cleanup.
 *
 * @param instance The `RemoteCommunication` instance associated with this event handler.
 * @returns A function that acts as the event handler for the "socket_reconnect" event.
 */
export declare function handleSocketReconnectEvent(instance: RemoteCommunication): () => void;
//# sourceMappingURL=handleSocketReconnectEvent.d.ts.map