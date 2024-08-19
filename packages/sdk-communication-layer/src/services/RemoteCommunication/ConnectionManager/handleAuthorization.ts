import { logger } from '../../../utils/logger';
import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { EventType } from '../../../types/EventType';

/**
 * Manages the message authorization process for a RemoteCommunication instance. It ensures that only authorized messages are sent through the communication layer. For backwards compatibility, messages sent by wallets older than version 7.3 are also handled.
 *
 * @param instance The current instance of the RemoteCommunication class.
 * @param message The message from the CommunicationLayer that needs authorization before being sent.
 * @returns Promise<void> Resolves when the message has been processed, either by sending it or by ensuring the necessary authorization.
 */
export async function handleAuthorization(
  instance: RemoteCommunication,
  message: CommunicationLayerMessage,
): Promise<void> {
  return new Promise((resolve) => {
    const { state } = instance;

    logger.RemoteCommunication(
      `[RemoteCommunication: handleAuthorization()] context=${state.context} ready=${state.ready} authorized=${state.authorized} method=${message.method}`,
    );

    if (!state.isOriginator || state.authorized || state.relayPersistence) {
      state.communicationLayer?.sendMessage(message);
      resolve();
    } else {
      instance.once(EventType.AUTHORIZED, () => {
        logger.RemoteCommunication(
          `[RemoteCommunication: handleAuthorization()] context=${state.context}  AFTER SKIP / AUTHORIZED -- sending pending message`,
        );
        // only send the message after the clients have awaken.
        state.communicationLayer?.sendMessage(message);
        resolve();
      });
    }
  });
}
