import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { EventType } from '../../../types/EventType';
import { MessageType } from '../../../types/MessageType';
import { handleAuthorizedMessage } from './handleAuthorizedMessage';
import { handleOriginatorInfoMessage } from './handleOriginatorInfoMessage';
import { handleOtpMessage } from './handleOtpMessage';
import { handlePauseMessage } from './handlePauseMessage';
import { handleReadyMessage } from './handleReadyMessage';
import { handleTerminateMessage } from './handleTerminateMessage';
import { handleWalletInfoMessage } from './handleWalletInfoMessage';

/**
 * Central dispatcher function to handle messages for a `RemoteCommunication` instance.
 *
 * The function takes a message of type `CommunicationLayerMessage` and a `RemoteCommunication` instance
 * and based on the `message.type` decides which specific handler function should be invoked.
 *
 * Steps taken by the function:
 *
 * 1. Logs the incoming message if `debug` mode is enabled.
 * 2. Sets the `ready` status of the instance to `true`.
 * 3. Checks the `message.type` and the `isOriginator` status of the instance to determine the relevant handler.
 * 4. Invokes the specific handler function based on the determined conditions.
 * 5. If the message doesn't match specific criteria, it emits a general `MESSAGE` event.
 *
 * @param message The incoming `CommunicationLayerMessage` that needs to be processed.
 * @param instance The `RemoteCommunication` instance that is the target of the message.
 */
export function onCommunicationLayerMessage(
  message: CommunicationLayerMessage,
  instance: RemoteCommunication,
) {
  const { state } = instance;
  if (state.debug) {
    console.debug(
      `RemoteCommunication::${
        state.context
      }::on 'message' typeof=${typeof message}`,
      message,
    );
  }

  instance.state.ready = true;

  if (!state.isOriginator && message.type === MessageType.ORIGINATOR_INFO) {
    handleOriginatorInfoMessage(instance, message);
    return;
  } else if (state.isOriginator && message.type === MessageType.WALLET_INFO) {
    handleWalletInfoMessage(instance, message);
    return;
  } else if (message.type === MessageType.TERMINATE) {
    handleTerminateMessage(instance);
  } else if (message.type === MessageType.PAUSE) {
    handlePauseMessage(instance);
  } else if (message.type === MessageType.READY && state.isOriginator) {
    handleReadyMessage(instance);
  } else if (message.type === MessageType.OTP && state.isOriginator) {
    handleOtpMessage(instance, message);
    return;
  } else if (message.type === MessageType.AUTHORIZED && state.isOriginator) {
    handleAuthorizedMessage(instance);
  }

  // TODO should it check if only emiting JSON-RPC message?
  instance.emit(EventType.MESSAGE, message);
}
