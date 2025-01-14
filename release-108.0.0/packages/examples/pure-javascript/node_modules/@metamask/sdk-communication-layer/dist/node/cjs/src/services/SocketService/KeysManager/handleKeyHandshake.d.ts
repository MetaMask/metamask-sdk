import { SocketService } from '../../../SocketService';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
/**
 * Handles the sending of key handshake messages.
 * If the message type starts with 'key_handshake', the function sends the message without encryption.
 *
 * @param instance The current instance of the SocketService.
 * @param message The message to be sent.
 * @returns {boolean} Returns true if the message was a key handshake message, otherwise false.
 */
export declare function handleKeyHandshake(instance: SocketService, message: CommunicationLayerMessage): void;
//# sourceMappingURL=handleKeyHandshake.d.ts.map