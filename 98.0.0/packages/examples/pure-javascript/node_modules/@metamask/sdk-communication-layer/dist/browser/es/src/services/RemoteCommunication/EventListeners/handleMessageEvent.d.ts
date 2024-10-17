import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
/**
 * Creates and returns an event handler function for the "message" event. This handler processes incoming messages intended for a `RemoteCommunication` instance, ensuring they're formatted correctly and delegating to the appropriate message handlers.
 *
 * @param instance The `RemoteCommunication` instance associated with this event handler.
 * @returns A function that acts as the event handler for the "message" event, expecting a message of type `CommunicationLayerMessage`.
 */
export declare function handleMessageEvent(instance: RemoteCommunication): (_message: CommunicationLayerMessage) => void;
//# sourceMappingURL=handleMessageEvent.d.ts.map