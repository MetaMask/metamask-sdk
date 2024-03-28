import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
/**
 * Manages the message authorization process for a RemoteCommunication instance. It ensures that only authorized messages are sent through the communication layer. For backwards compatibility, messages sent by wallets older than version 7.3 are also handled.
 *
 * @param instance The current instance of the RemoteCommunication class.
 * @param message The message from the CommunicationLayer that needs authorization before being sent.
 * @returns Promise<void> Resolves when the message has been processed, either by sending it or by ensuring the necessary authorization.
 */
export declare function handleAuthorization(instance: RemoteCommunication, message: CommunicationLayerMessage): Promise<void>;
//# sourceMappingURL=handleAuthorization.d.ts.map