import { RemoteCommunication } from '../../RemoteCommunication';

/**
 * Creates and returns an event handler function for the "socket_Disconnected" event. This handler processes socket disconnection events for a `RemoteCommunication` instance, updating its internal state accordingly.
 *
 * Key steps performed by the handler:
 * 1. It checks if the `debug` flag is set in the `RemoteCommunication` instance state. If so, it logs a debug message indicating that the socket has disconnected and the ready state is being set to false.
 * 2. It updates the `ready` property of the `RemoteCommunication` instance state to false, indicating that the instance is no longer in a ready state due to the socket disconnection.
 *
 * @param instance The `RemoteCommunication` instance associated with this event handler.
 * @returns A function that acts as the event handler for the "socket_Disconnected" event.
 */
export function handleSocketDisconnectedEvent(instance: RemoteCommunication) {
  return () => {
    if (instance.state.debug) {
      console.debug(
        `RemoteCommunication::on 'socket_Disconnected' set ready to false`,
      );
    }
    instance.state.ready = false;
  };
}
