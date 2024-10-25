import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerPreference } from '../../../types/CommunicationLayerPreference';
/**
 * Creates and returns an event handler function for the "CLIENTS_CONNECTED" event. This handler function manages the connected clients for a given RemoteCommunication instance.
 *
 * When clients successfully connect:
 * 1. If debugging is enabled, the event details (channel ID and keys exchanged status) are logged for diagnostics.
 * 2. If analytics tracking is enabled, the analytics data is collected and sent to the server. This data includes the SDK version, wallet version, communication layer version, and other relevant information.
 * 3. The state of the RemoteCommunication instance is updated to reflect that clients have successfully connected and that the originator information hasn't been sent yet.
 * 4. The "CLIENTS_CONNECTED" event is emitted to inform other parts of the system about the successful connection of clients.
 *
 * @param instance The instance of RemoteCommunication for which the event handler function is being created.
 * @param communicationLayerPreference The preferred communication layer used for this connection.
 * @returns A function that acts as the event handler for the "CLIENTS_CONNECTED" event.
 */
export declare function handleClientsConnectedEvent(instance: RemoteCommunication, communicationLayerPreference: CommunicationLayerPreference): () => void;
//# sourceMappingURL=handleClientsConnectedEvent.d.ts.map