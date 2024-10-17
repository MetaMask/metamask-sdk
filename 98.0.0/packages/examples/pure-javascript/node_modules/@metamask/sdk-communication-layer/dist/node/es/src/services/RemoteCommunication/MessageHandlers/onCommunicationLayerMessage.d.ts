import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
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
export declare function onCommunicationLayerMessage(message: CommunicationLayerMessage, instance: RemoteCommunication): void;
//# sourceMappingURL=onCommunicationLayerMessage.d.ts.map