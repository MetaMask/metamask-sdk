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
    if (instance.state.debug) {
      console.log(
        `RemoteCommunication::${instance.state.context}::sendMessage::handleAuthorization ready=${instance.state.ready} authorized=${instance.state.authorized} method=${message.method}`,
      );
    }

    // TODO remove after wallet 7.3+ is deployed
    // backward compatibility for wallet <7.3
    if ('7.3'.localeCompare(instance.state.walletInfo?.version || '') === 1) {
      if (instance.state.debug) {
        console.debug(
          `compatibility hack wallet version > ${instance.state.walletInfo?.version}`,
        );
      }
      instance.state.communicationLayer?.sendMessage(message);
      resolve();
      return;
    }

    if (!instance.state.isOriginator || instance.state.authorized) {
      instance.state.communicationLayer?.sendMessage(message);
      resolve();
    } else {
      instance.once(EventType.AUTHORIZED, () => {
        if (instance.state.debug) {
          console.log(
            `RemoteCommunication::${instance.state.context}::sendMessage  AFTER SKIP / AUTHORIZED -- sending pending message`,
          );
        }
        // only send the message after the clients have awaken.
        instance.state.communicationLayer?.sendMessage(message);
        resolve();
      });
    }
  });
}
