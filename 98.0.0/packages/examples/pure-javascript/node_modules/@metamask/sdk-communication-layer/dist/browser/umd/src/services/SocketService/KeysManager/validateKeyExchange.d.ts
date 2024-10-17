import { SocketService } from '../../../SocketService';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
/**
 * Validates whether key exchange has been completed before sending a message.
 * If keys are not exchanged, an error is thrown.
 *
 * @param instance The current instance of the SocketService.
 * @param message The message for which to validate key exchange.
 * @throws {Error} Thrown if keys have not been exchanged.
 */
export declare function validateKeyExchange(instance: SocketService, message: CommunicationLayerMessage): void;
//# sourceMappingURL=validateKeyExchange.d.ts.map