import { SocketService } from '../../../SocketService';
/**
 * Returns a handler function to handle the 'clients_disconnected' event.
 * This handler updates the clientsConnected state to false, and if the instance is the originator
 * and clients are not paused, it cleans the key exchange.
 * It also emits the CLIENTS_DISCONNECTED event.
 *
 * @param instance The current instance of the SocketService.
 * @param channelId The ID of the channel.
 * @returns {Function} A handler function for the 'clients_disconnected' event.
 */
export declare function handlesClientsDisconnected(instance: SocketService, channelId: string): () => void;
//# sourceMappingURL=handlesClientsDisconnected.d.ts.map