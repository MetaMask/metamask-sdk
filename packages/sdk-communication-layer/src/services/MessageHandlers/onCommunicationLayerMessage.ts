import EventEmitter2 from 'eventemitter2';
import { RemoteCommunicationState } from '../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../types/CommunicationLayerMessage';
import { EventType } from '../../types/EventType';
import { MessageType } from '../../types/MessageType';
import { handleOriginatorInfoMessage } from './handleOriginatorInfoMessage';
import { handleWalletInfoMessage } from './handleWalletInfoMessage';
import { handleTerminateMessage } from './handleTerminateMessage';
import { handlePauseMessage } from './handlePauseMessage';
import { handleReadyMessage } from './handleReadyMessage';
import { handleOtpMessage } from './handleOtpMessage';
import { handleAuthorizedMessage } from './handleAuthorizedMessage';

export function onCommunicationLayerMessage(
  message: CommunicationLayerMessage,
  state: RemoteCommunicationState,
  emit: EventEmitter2['emit'],
) {
  if (state.debug) {
    console.debug(
      `RemoteCommunication::${
        state.context
      }::on 'message' typeof=${typeof message}`,
      message,
    );
  }

  state.ready = true;

  if (!state.isOriginator && message.type === MessageType.ORIGINATOR_INFO) {
    handleOriginatorInfoMessage(state, message, emit);
    return;
  } else if (state.isOriginator && message.type === MessageType.WALLET_INFO) {
    handleWalletInfoMessage(state, message);
    return;
  } else if (message.type === MessageType.TERMINATE) {
    handleTerminateMessage(state, emit);
  } else if (message.type === MessageType.PAUSE) {
    handlePauseMessage(state, emit);
  } else if (message.type === MessageType.READY && state.isOriginator) {
    handleReadyMessage(state, emit);
  } else if (message.type === MessageType.OTP && state.isOriginator) {
    handleOtpMessage(state, message, emit);
    return;
  } else if (message.type === MessageType.AUTHORIZED && state.isOriginator) {
    handleAuthorizedMessage(state, emit);
  }

  // TODO should it check if only emiting JSON-RPC message?
  emit(EventType.MESSAGE, message);
}
