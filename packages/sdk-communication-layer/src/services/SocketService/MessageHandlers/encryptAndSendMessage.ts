import { logger } from '../../../utils/logger';
import { SocketService } from '../../../SocketService';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { EventType } from '../../../types/EventType';
import { MessageType } from '../../../types/MessageType';

/**
 * Encrypts and sends the provided message using the SocketService instance.
 * It encrypts the message using the key exchange and prepares the message to be sent.
 * If the instance has plaintext debugging enabled, it includes the plaintext version of the message.
 * The function logs debug information about the encrypted message before sending it.
 *
 * @param instance The current instance of the SocketService.
 * @param message The message to be encrypted and sent.
 */
export function encryptAndSendMessage(
  instance: SocketService,
  message: CommunicationLayerMessage,
) {
  const encryptedMessage = instance.state.keyExchange?.encryptMessage(
    JSON.stringify(message),
  );
  const messageToSend = {
    id: instance.state.channelId,
    context: instance.state.context,
    clientType: instance.state.isOriginator ? 'dapp' : 'wallet',
    message: encryptedMessage,
    plaintext: instance.state.hasPlaintext
      ? JSON.stringify(message)
      : undefined,
  };

  logger.SocketService(
    `[SocketService: encryptAndSendMessage()] context=${instance.state.context}`,
    messageToSend,
  );

  if (message.type === MessageType.TERMINATE) {
    instance.state.manualDisconnect = true;
  }
  instance.state.socket?.emit(EventType.MESSAGE, messageToSend);
}
