import EventEmitter2 from 'eventemitter2';
import { RemoteCommunicationState } from '../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../types/CommunicationLayerMessage';
import { EventType } from '../../types/EventType';
import { MessageType } from '../../types/MessageType';

export function handleOriginatorInfoMessage(
  state: RemoteCommunicationState,
  message: CommunicationLayerMessage,
  emit: EventEmitter2['emit'],
) {
  // TODO why these hardcoded value?
  state.communicationLayer?.sendMessage({
    type: MessageType.WALLET_INFO,
    walletInfo: state.walletInfo,
  });
  state.originatorInfo = message.originatorInfo || message.originator;
  emit(EventType.CLIENTS_READY, {
    isOriginator: state.isOriginator,
    originatorInfo: state.originatorInfo,
  });
  state.paused = false;
}
