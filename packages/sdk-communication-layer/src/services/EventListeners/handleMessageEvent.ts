import { RemoteCommunication } from '../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../types/CommunicationLayerMessage';
import { onCommunicationLayerMessage } from '../MessageHandlers';
/**
 * Creates and returns an event handler function for the "message" event. This handler processes incoming messages intended for a `RemoteCommunication` instance, ensuring they're formatted correctly and delegating to the appropriate message handlers.
 *
 * Key steps performed by the handler:
 * 1. It checks whether the incoming message is encapsulated, which might be the case for backward compatibility reasons. If encapsulated, it extracts the inner message for further processing.
 * 2. It delegates the processing of the message to the `onCommunicationLayerMessage` function, which can handle various types of communication layer messages.
 *
 * @param instance The `RemoteCommunication` instance associated with this event handler.
 * @returns A function that acts as the event handler for the "message" event, expecting a message of type `CommunicationLayerMessage`.
 */
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
