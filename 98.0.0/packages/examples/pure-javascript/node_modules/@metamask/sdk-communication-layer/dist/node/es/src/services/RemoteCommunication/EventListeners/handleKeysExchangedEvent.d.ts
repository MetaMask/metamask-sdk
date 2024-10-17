import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerPreference } from '../../../types/CommunicationLayerPreference';
import { OriginatorInfo } from '../../../types/OriginatorInfo';
/**
 * Creates and returns an event handler function for the "keys_exchanged" event. This handler is responsible for managing the state and operations associated with the key exchange process within a `RemoteCommunication` instance.
 *
 * Upon successful key exchange:
 * 1. Diagnostic information is logged if debugging is enabled.
 * 2. If keys have been successfully exchanged, the connection status of the `RemoteCommunication` instance is set to "LINKED".
 * 3. The last active date for the instance is updated.
 * 4. Analytics data is sent, if applicable, including details such as the SDK version, communication layer preference, package version, and wallet version.
 * 5. The state variable `isOriginator` is updated based on the incoming message.
 * 6. If the current instance is not the originator:
 *    a. It avoids sending the originator message from the wallet side.
 *    b. A message of type "READY" is sent to notify that the connection is ready.
 *    c. The instance's readiness and paused states are updated.
 * 7. For backward compatibility, if the instance is the originator and the originator information has not been sent:
 *    a. A message of type "ORIGINATOR_INFO" is sent containing the originator details.
 *    b. The state variable `originatorInfoSent` is updated to indicate that the originator information has been transmitted.
 *
 * @param instance The `RemoteCommunication` instance for which the event handler function is being created.
 * @param communicationLayerPreference The communication layer preference, used for analytics.
 * @returns A function that acts as the event handler for the "keys_exchanged" event, expecting a message containing details about the key exchange.
 */
export declare function handleKeysExchangedEvent(instance: RemoteCommunication, communicationLayerPreference: CommunicationLayerPreference): (message: {
    isOriginator: boolean;
    originatorInfo: OriginatorInfo;
    originator: OriginatorInfo;
}) => void;
//# sourceMappingURL=handleKeysExchangedEvent.d.ts.map