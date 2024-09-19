import { logger } from '../../../utils/logger';
import { SocketService } from '../../../SocketService';
import { MessageType } from '../../../types/MessageType';

/**
 * Pauses the connection of a SocketService instance.
 * If the keys have been exchanged, a PAUSE message is sent before
 * the socket is manually disconnected.
 *
 * @param instance The current instance of the SocketService.
 */
export function pause(instance: SocketService) {
  logger.SocketService(
    `[SocketService: pause()] context=${instance.state.context}`,
  );

  instance.state.manualDisconnect = true;
  if (instance.state.keyExchange?.areKeysExchanged()) {
    instance.sendMessage({ type: MessageType.PAUSE }).catch((error) => {
      console.error('[pause] sendMessage error', error);
    });
  }
  instance.state.socket?.disconnect();
}
