import { RemoteCommunication } from '../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../types/CommunicationLayerMessage';
import { EventType } from '../../types/EventType';
import { MessageType } from '../../types/MessageType';

/**
 * Handles the originator information message for a `RemoteCommunication` instance.
 *
 * The originator information message is typically used to exchange identification information between peers or entities within the communication process. This function achieves the following:
 *
 * 1. It sends back a `WALLET_INFO` message type containing the wallet information stored in the instance state. This step is useful for the receiver to identify and understand the capabilities and version of the wallet that is currently communicating.
 * 2. It updates the `originatorInfo` property of the `RemoteCommunication` instance state with the received originator information from the message. This provides a reference to the sender's identification information for future interactions.
 * 3. It emits a `CLIENTS_READY` event with relevant data, which can be consumed by listeners to know when the clients (i.e., both the sender and receiver) are ready for communication.
 * 4. It sets the `paused` state of the instance to `false`, indicating active communication.
 *
 * @param instance The `RemoteCommunication` instance on which the originator information message is processed.
 * @param message The received `CommunicationLayerMessage` containing the originator information.
 */
export function handleOriginatorInfoMessage(
  instance: RemoteCommunication,
  message: CommunicationLayerMessage,
) {
  // TODO why these hardcoded value?
  instance.state.communicationLayer?.sendMessage({
    type: MessageType.WALLET_INFO,
    walletInfo: instance.state.walletInfo,
  });
  instance.state.originatorInfo = message.originatorInfo || message.originator;
  instance.emit(EventType.CLIENTS_READY, {
    isOriginator: instance.state.isOriginator,
    originatorInfo: instance.state.originatorInfo,
  });
  instance.state.paused = false;
}
