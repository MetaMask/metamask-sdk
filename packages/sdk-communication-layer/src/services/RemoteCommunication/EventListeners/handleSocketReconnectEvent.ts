import { RemoteCommunication } from '../../../RemoteCommunication';
import { clean } from '../ChannelManager';

/**
 * Creates and returns an event handler function for the "socket_reconnect" event. This handler processes socket reconnection events for a `RemoteCommunication` instance, updating its internal state and performing necessary cleanup.
 *
 * @param instance The `RemoteCommunication` instance associated with this event handler.
 * @returns A function that acts as the event handler for the "socket_reconnect" event.
 */
export function handleSocketReconnectEvent(instance: RemoteCommunication) {
  return () => {
    const { state } = instance;

    if (state.debug) {
      console.debug(
        `RemoteCommunication::on 'socket_reconnect' -- reset key exchange status / set ready to false`,
      );
    }
    state.ready = false;
    clean(state);
  };
}
