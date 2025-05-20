import { SocketService } from '../../../SocketService';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
/**
 * Handles the waiting for RPC replies for the provided message.
 * If the instance is the originator of the message and the message has an associated RPC ID,
 * it waits for the corresponding RPC reply using the `waitForRpc` utility function.
 * When the reply is received, it logs debug information about the RPC reply.
 *
 * @param instance The current instance of the SocketService.
 * @param message The message for which to handle RPC replies.
 */
export declare function handleRpcReplies(instance: SocketService, message: CommunicationLayerMessage): Promise<void>;
//# sourceMappingURL=handleRpcReplies.d.ts.map