import { SocketService } from '../../../SocketService';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { EventType } from '../../../types/EventType';

/**
 * Tracks the RPC method for the provided message in the `rpcMethodTracker` object.
 * If the instance is the originator of the message and the message has an associated RPC ID,
 * it records the method and timestamp in the `rpcMethodTracker` for later reference.
 *
 * @param instance The current instance of the SocketService.
 * @param message The message for which to track the RPC method.
 */
export function trackRpcMethod(
  instance: SocketService,
  message: CommunicationLayerMessage,
) {
  const method = message?.method ?? '';
  const rpcId = message?.id;
  if (instance.state.isOriginator && rpcId) {
    instance.state.rpcMethodTracker[rpcId] = {
      id: rpcId,
      timestamp: Date.now(),
      method,
    };
    instance.emit(EventType.RPC_UPDATE, instance.state.rpcMethodTracker[rpcId]);
  }
}
