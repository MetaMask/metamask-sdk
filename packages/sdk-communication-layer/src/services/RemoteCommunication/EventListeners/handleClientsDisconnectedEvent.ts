import { RemoteCommunication } from '../../../RemoteCommunication';
import { ConnectionStatus } from '../../../types/ConnectionStatus';
import { EventType } from '../../../types/EventType';
import { logger } from '../../../utils/logger';

/**
 * Creates and returns an event handler function for the "CLIENTS_DISCONNECTED" event. This handler function manages the state and operations when clients get disconnected from a RemoteCommunication instance.
 *
 * Upon client disconnection:
 * 1. If debugging is enabled, logs the channel ID associated with the disconnection event for diagnostics.
 * 2. Updates the `RemoteCommunication` instance state to indicate that clients are no longer connected, sets connection status to "DISCONNECTED", and resets the "ready" and "authorized" flags.
 * 3. Emits a "CLIENTS_DISCONNECTED" event to notify other parts of the system about the disconnection. This is useful for managing UI states or triggering certain operations.
 * 4. If analytics tracking is enabled and a channel ID is available, sends disconnection analytics data to the server. This data includes the SDK version, wallet version, communication layer version, and other relevant details.
 *
 * @param instance The instance of RemoteCommunication for which the event handler function is being created.
 * @param communicationLayerPreference The preferred communication layer used for this connection.
 * @returns A function that acts as the event handler for the "CLIENTS_DISCONNECTED" event, expecting a channel ID as its parameter.
 */
export function handleClientsDisconnectedEvent(instance: RemoteCommunication) {
  return (channelId: string) => {
    const { state } = instance;

    logger.RemoteCommunication(
      `[RemoteCommunication: handleClientsDisconnectedEvent()] context=${state.context} on 'clients_disconnected' channelId=${channelId}`,
    );

    // Ignore status change when relay persistence is available
    if (!state.relayPersistence) {
      state.clientsConnected = false;
      state.ready = false;
      state.authorized = false;
    }

    // Propagate the disconnect event to clients.
    instance.emit(EventType.CLIENTS_DISCONNECTED, state.channelId);
    instance.setConnectionStatus(ConnectionStatus.DISCONNECTED);
  };
}
