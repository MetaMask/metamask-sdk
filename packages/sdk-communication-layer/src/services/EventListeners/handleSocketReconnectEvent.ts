import { RemoteCommunication } from '../../RemoteCommunication';
import { clean } from '../ChannelManager';

/**
 * Creates and returns an event handler function for the "socket_reconnect" event. This handler processes socket reconnection events for a `RemoteCommunication` instance, updating its internal state and performing necessary cleanup.
 *
 * Key steps performed by the handler:
 * 1. Checks if the `debug` flag is set in the `RemoteCommunication` instance state. If so, it logs a debug message, indicating that the socket has reconnected and certain internal states are being reset.
 * 2. It updates the `ready` property of the `RemoteCommunication` instance state to false, signaling that the instance is no longer in a ready state due to the socket reconnection.
 * 3. Invokes the `clean` function from the `ChannelManager` module with the `state` of the instance, ensuring any lingering channel-related data is reset.
 *
 * @param instance The `RemoteCommunication` instance associated with this event handler.
 * @returns A function that acts as the event handler for the "socket_reconnect" event.
 */
export function handleSocketReconnectEvent(instance: RemoteCommunication) {
  return () => {
    if (instance.state.debug) {
      console.debug(
        `RemoteCommunication::on 'socket_reconnect' -- reset key exchange status / set ready to false`,
      );
    }
    instance.state.ready = false;
    clean(instance.state);
  };
}
