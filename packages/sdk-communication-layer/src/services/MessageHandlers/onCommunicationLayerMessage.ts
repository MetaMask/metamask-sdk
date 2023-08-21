import { RemoteCommunication } from '../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../types/CommunicationLayerMessage';
import { EventType } from '../../types/EventType';
import { MessageType } from '../../types/MessageType';
import { handleAuthorizedMessage } from './handleAuthorizedMessage';
import { handleOriginatorInfoMessage } from './handleOriginatorInfoMessage';
import { handleOtpMessage } from './handleOtpMessage';
import { handlePauseMessage } from './handlePauseMessage';
import { handleReadyMessage } from './handleReadyMessage';
import { handleTerminateMessage } from './handleTerminateMessage';
import { handleWalletInfoMessage } from './handleWalletInfoMessage';

export function onCommunicationLayerMessage(
  message: CommunicationLayerMessage,
  instance: RemoteCommunication,
) {
  if (instance.state.debug) {
    console.debug(
      `RemoteCommunication::${
        instance.state.context
      }::on 'message' typeof=${typeof message}`,
      message,
    );
  }

  instance.state.ready = true;

  if (
    !instance.state.isOriginator &&
    message.type === MessageType.ORIGINATOR_INFO
  ) {
    handleOriginatorInfoMessage(instance, message);
    return;
  } else if (
    instance.state.isOriginator &&
    message.type === MessageType.WALLET_INFO
  ) {
    handleWalletInfoMessage(instance, message);
    return;
  } else if (message.type === MessageType.TERMINATE) {
    handleTerminateMessage(instance);
  } else if (message.type === MessageType.PAUSE) {
    handlePauseMessage(instance);
  } else if (
    message.type === MessageType.READY &&
    instance.state.isOriginator
  ) {
    handleReadyMessage(instance);
  } else if (message.type === MessageType.OTP && instance.state.isOriginator) {
    handleOtpMessage(instance, message);
    return;
  } else if (
    message.type === MessageType.AUTHORIZED &&
    instance.state.isOriginator
  ) {
    handleAuthorizedMessage(instance);
  }

  // TODO should it check if only emiting JSON-RPC message?
  instance.emit(EventType.MESSAGE, message);
}
