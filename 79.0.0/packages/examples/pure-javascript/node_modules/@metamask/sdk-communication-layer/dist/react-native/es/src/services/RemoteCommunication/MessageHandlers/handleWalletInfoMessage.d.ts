import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
/**
 * Handles the 'walletInfo' message for a `RemoteCommunication` instance.
 *
 * When a 'walletInfo' message is received, this function is responsible for updating the current `RemoteCommunication`
 * instance's state with the received wallet information and resetting the paused state of the instance.
 *
 * The sequence of actions taken on receiving a 'walletInfo' message is as follows:
 *
 * 1. Update the `walletInfo` property of the instance's state with the `walletInfo` received in the message.
 * 2. Reset the `paused` status of the instance to `false`.
 *
 * Previously, there was some additional code (commented out) that handled a specific backward compatibility scenario.
 * When the wallet version was less than '6.6', an AUTHORIZED event was simulated, ensuring compatibility with older
 * versions. This backward compatibility code has been deprecated and is preserved in comments for reference purposes.
 *
 * @param instance The `RemoteCommunication` instance that needs to be acted upon when a walletInfo message is received.
 * @param message The `CommunicationLayerMessage` object containing the wallet information.
 */
export declare function handleWalletInfoMessage(instance: RemoteCommunication, message: CommunicationLayerMessage): void;
//# sourceMappingURL=handleWalletInfoMessage.d.ts.map