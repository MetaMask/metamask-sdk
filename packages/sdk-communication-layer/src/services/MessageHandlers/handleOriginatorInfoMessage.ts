import { RemoteCommunication } from '../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../types/CommunicationLayerMessage';
import { EventType } from '../../types/EventType';
import { MessageType } from '../../types/MessageType';

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
