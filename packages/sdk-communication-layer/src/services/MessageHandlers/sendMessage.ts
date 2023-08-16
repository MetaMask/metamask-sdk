import EventEmitter2 from 'eventemitter2';
import { RemoteCommunicationState } from '../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../types/CommunicationLayerMessage';
import { EventType } from '../../types/EventType';
import { handleAuthorization } from '../ConnectionManager';

export async function sendMessage(
  state: RemoteCommunicationState,
  message: CommunicationLayerMessage,
  once: EventEmitter2['once'],
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (state.debug) {
      console.log(
        `RemoteCommunication::${state.context}::sendMessage paused=${
          state.paused
        } ready=${state.ready} authorized=${
          state.authorized
        } socker=${state.communicationLayer?.isConnected()} clientsConnected=${
          state.clientsConnected
        } status=${state._connectionStatus}`,
        message,
      );
    }

    if (
      state.paused ||
      !state.ready ||
      !state.communicationLayer?.isConnected() ||
      !state.clientsConnected
    ) {
      if (state.debug) {
        console.log(
          `RemoteCommunication::${state.context}::sendMessage  SKIP message waiting for MM mobile readiness.`,
        );
      }

      once(EventType.CLIENTS_READY, async () => {
        if (state.debug) {
          console.log(
            `RemoteCommunication::${state.context}::sendMessage  AFTER SKIP / READY -- sending pending message`,
          );
        }

        try {
          await handleAuthorization(state, message, once);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    } else {
      // Send the message or wait for authorization
      handleAuthorization(state, message, once)
        .then(() => {
          resolve();
        })
        .catch((err: unknown) => {
          console.error(
            `RemoteCommunication::${state.context}::sendMessage  ERROR`,
            err,
          );
          reject(err);
        });
    }
  });
}
