import { SocketService } from '../../../SocketService';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
/**
 * Encrypts and sends the provided message using the SocketService instance.
 * It encrypts the message using the key exchange and prepares the message to be sent.
 * If the instance has plaintext debugging enabled, it includes the plaintext version of the message.
 * The function logs debug information about the encrypted message before sending it.
 *
 * @param instance The current instance of the SocketService.
 * @param message The message to be encrypted and sent.
 */
export declare function encryptAndSendMessage(instance: SocketService, message: CommunicationLayerMessage): void;
//# sourceMappingURL=encryptAndSendMessage.d.ts.map