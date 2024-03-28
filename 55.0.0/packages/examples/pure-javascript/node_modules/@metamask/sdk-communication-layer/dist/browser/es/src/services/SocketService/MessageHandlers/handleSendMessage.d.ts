import { SocketService } from '../../../SocketService';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
export declare const lcLogguedRPCs: string[];
/**
 * Handles sending a message using the SocketService instance.
 * It first checks if a channel has been created and throws an error if not.
 * Then, it logs debug information about the message and its encryption status.
 * It checks if the message is a key handshake message and handles it if it is.
 * If the message is not a key handshake message, it validates the key exchange status.
 * It tracks the RPC method if applicable.
 * It encrypts and sends the message.
 * Finally, if the user is the originator, it waits for a reply in case of certain messages.
 *
 * @param instance The current instance of the SocketService.
 * @param message The message to be sent.
 */
export declare function handleSendMessage(instance: SocketService, message: CommunicationLayerMessage): void;
//# sourceMappingURL=handleSendMessage.d.ts.map