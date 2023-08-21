import { RemoteCommunication } from '../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../types/CommunicationLayerMessage';
import { onCommunicationLayerMessage } from '../MessageHandlers';

export function handleMessageEvent(instance: RemoteCommunication) {
  return (_message: CommunicationLayerMessage) => {
    let message = _message;
    // check if message is encapsulated for backward compatibility
    if (_message.message) {
      message = message.message as CommunicationLayerMessage;
    }
    onCommunicationLayerMessage(message, instance);
  };
}
