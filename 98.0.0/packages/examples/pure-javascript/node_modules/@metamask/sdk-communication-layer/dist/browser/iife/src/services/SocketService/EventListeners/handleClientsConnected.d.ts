import { SocketService } from '../../../SocketService';
/**
 * Returns an asynchronous handler function to handle the 'clients_connected' event for a specific channel.
 * This handler informs the other layer about clients reconnection, emits a CLIENTS_CONNECTED event,
 * and handles key exchange scenarios and reconnection situations.
 *
 * @param instance The current instance of the SocketService.
 * @param channelId The ID of the channel associated with the handler.
 * @returns {Function} An asynchronous handler function for the 'clients_connected' event.
 */
export declare function handleClientsConnected(instance: SocketService, channelId: string): (_id: string) => Promise<void>;
//# sourceMappingURL=handleClientsConnected.d.ts.map