import { RemoteCommunication } from '../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../types/CommunicationLayerMessage';
import { EventType } from '../../types/EventType';
import { handleAuthorization } from '../ConnectionManager';

export async function sendMessage(
  instance: RemoteCommunication,
  message: CommunicationLayerMessage,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (instance.state.debug) {
      console.log(
        `RemoteCommunication::${instance.state.context}::sendMessage paused=${
          instance.state.paused
        } ready=${instance.state.ready} authorized=${
          instance.state.authorized
        } socker=${instance.state.communicationLayer?.isConnected()} clientsConnected=${
          instance.state.clientsConnected
        } status=${instance.state._connectionStatus}`,
        message,
      );
    }

    if (
      instance.state.paused ||
      !instance.state.ready ||
      !instance.state.communicationLayer?.isConnected() ||
      !instance.state.clientsConnected
    ) {
      if (instance.state.debug) {
        console.log(
          `RemoteCommunication::${instance.state.context}::sendMessage  SKIP message waiting for MM mobile readiness.`,
        );
      }

      instance.once(EventType.CLIENTS_READY, async () => {
        if (instance.state.debug) {
          console.log(
            `RemoteCommunication::${instance.state.context}::sendMessage  AFTER SKIP / READY -- sending pending message`,
          );
        }

        try {
          await handleAuthorization(instance, message);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    } else {
      // Send the message or wait for authorization
      handleAuthorization(instance, message)
        .then(() => {
          resolve();
        })
        .catch((err: unknown) => {
          console.error(
            `RemoteCommunication::${instance.state.context}::sendMessage  ERROR`,
            err,
          );
          reject(err);
        });
    }
  });
}
