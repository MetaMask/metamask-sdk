import { SocketService } from '../../../SocketService';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
/**
 * Tracks the RPC method for the provided message in the `rpcMethodTracker` object.
 * If the instance is the originator of the message and the message has an associated RPC ID,
 * it records the method and timestamp in the `rpcMethodTracker` for later reference.
 *
 * @param instance The current instance of the SocketService.
 * @param message The message for which to track the RPC method.
 */
export declare function trackRpcMethod(instance: SocketService, message: CommunicationLayerMessage): void;
//# sourceMappingURL=trackRpcMethod.d.ts.map