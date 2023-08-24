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
export function validateKeyExchange(
  instance: SocketService,
  message: CommunicationLayerMessage,
) {
  if (!instance.state.keyExchange?.areKeysExchanged()) {
    if (instance.state.debug) {
      console.debug(
        `SocketService::${instance.state.context}::sendMessage() ERROR keys not exchanged`,
        message,
      );
    }
    throw new Error('Keys not exchanged BBB');
  }
}
