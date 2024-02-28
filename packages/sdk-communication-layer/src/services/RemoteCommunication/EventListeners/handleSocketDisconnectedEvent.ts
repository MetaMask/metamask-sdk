import { loggerRemoteLayer } from '../../../utils/logger';
import { RemoteCommunication } from '../../../RemoteCommunication';

/**
 * Creates and returns an event handler function for the "socket_Disconnected" event. This handler processes socket disconnection events for a `RemoteCommunication` instance, updating its internal state accordingly.
 *
 * @param instance The `RemoteCommunication` instance associated with this event handler.
 * @returns A function that acts as the event handler for the "socket_Disconnected" event.
 */
export function handleSocketDisconnectedEvent(instance: RemoteCommunication) {
  return () => {
    const { state } = instance;

    loggerRemoteLayer(
      `[RemoteCommunication: handleSocketDisconnectedEvent()] on 'socket_Disconnected' set ready to false`,
    );
    state.ready = false;
  };
}
