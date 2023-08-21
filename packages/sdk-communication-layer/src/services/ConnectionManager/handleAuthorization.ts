import { RemoteCommunication } from '../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../types/CommunicationLayerMessage';
import { EventType } from '../../types/EventType';

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
    const {
      debug,
      context,
      isOriginator,
      authorized,
      communicationLayer,
      walletInfo,
      ready,
    } = instance.state;

    if (debug) {
      console.log(
        `RemoteCommunication::${context}::sendMessage::handleAuthorization ready=${ready} authorized=${authorized} method=${message.method}`,
      );
    }

    // TODO remove after wallet 7.3+ is deployed
    // backward compatibility for wallet <7.3
    if ('7.3'.localeCompare(walletInfo?.version || '') === 1) {
      if (debug) {
        console.debug(
          `compatibility hack wallet version > ${walletInfo?.version}`,
        );
      }
      communicationLayer?.sendMessage(message);
      resolve();
      return;
    }

    if (!isOriginator || authorized) {
      communicationLayer?.sendMessage(message);
      resolve();
    } else {
      instance.once(EventType.AUTHORIZED, () => {
        if (debug) {
          console.log(
            `RemoteCommunication::${context}::sendMessage  AFTER SKIP / AUTHORIZED -- sending pending message`,
          );
        }
        // only send the message after the clients have awaken.
        communicationLayer?.sendMessage(message);
        resolve();
      });
    }
  });
}
