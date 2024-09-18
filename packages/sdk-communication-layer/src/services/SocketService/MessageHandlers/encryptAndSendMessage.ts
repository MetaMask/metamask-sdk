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
export async function encryptAndSendMessage(
  instance: SocketService,
  message: CommunicationLayerMessage,
): Promise<boolean> {
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

  return new Promise((resolve, reject) => {
    instance.state.socket?.emit(
      EventType.MESSAGE,
      messageToSend,
      (error: Error | null, response?: { success: boolean }) => {
        if (error) {
          logger.SocketService(
            `[SocketService: encryptAndSendMessage()] error=${error}`,
          );
          reject(error);
        }

        logger.SocketService(`[encryptAndSendMessage] response`, response);
        resolve(response?.success ?? false);
      },
    );
  });
}
