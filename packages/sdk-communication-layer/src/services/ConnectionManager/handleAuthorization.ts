import EventEmitter2 from 'eventemitter2';
import { RemoteCommunicationState } from '../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../types/CommunicationLayerMessage';
import { EventType } from '../../types/EventType';

export async function handleAuthorization(
  state: RemoteCommunicationState,
  message: CommunicationLayerMessage,
  once: EventEmitter2['once'],
): Promise<void> {
  return new Promise((resolve) => {
    if (state.debug) {
      console.log(
        `RemoteCommunication::${state.context}::sendMessage::handleAuthorization ready=${state.ready} authorized=${state.authorized} method=${message.method}`,
      );
    }

    // TODO remove after wallet 7.3+ is deployed
    // backward compatibility for wallet <7.3
    if ('7.3'.localeCompare(state.walletInfo?.version || '') === 1) {
      if (state.debug) {
        console.debug(
          `compatibility hack wallet version > ${state.walletInfo?.version}`,
        );
      }
      state.communicationLayer?.sendMessage(message);
      resolve();
      return;
    }

    if (!state.isOriginator || state.authorized) {
      state.communicationLayer?.sendMessage(message);
      resolve();
    } else {
      once(EventType.AUTHORIZED, () => {
        if (state.debug) {
          console.log(
            `RemoteCommunication::${state.context}::sendMessage  AFTER SKIP / AUTHORIZED -- sending pending message`,
          );
        }
        // only send the message after the clients have awaken.
        state.communicationLayer?.sendMessage(message);
        resolve();
      });
    }
  });
}
