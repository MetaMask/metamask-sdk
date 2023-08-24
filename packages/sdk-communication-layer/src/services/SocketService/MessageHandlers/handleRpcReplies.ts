import { SocketService } from '../../../SocketService';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { waitForRpc } from '../../../utils/wait';

/**
 * Handles the waiting for RPC replies for the provided message.
 * If the instance is the originator of the message and the message has an associated RPC ID,
 * it waits for the corresponding RPC reply using the `waitForRpc` utility function.
 * When the reply is received, it logs debug information about the RPC reply.
 *
 * @param instance The current instance of the SocketService.
 * @param message The message for which to handle RPC replies.
 */
export function handleRpcReplies(
  instance: SocketService,
  message: CommunicationLayerMessage,
) {
  const rpcId = message?.id;
  const method = message?.method ?? '';

  if (instance.state.isOriginator && rpcId) {
    waitForRpc(rpcId, instance.state.rpcMethodTracker, 200)
      .then((result) => {
        if (instance.state.debug) {
          console.debug(
            `SocketService::waitForRpc id=${rpcId} ${method} ( ${result.elapsedTime} ms)`,
            result.result,
          );
        }
      })
      .catch((err) => {
        console.warn(`Error rpcId=${rpcId} ${method}`, err);
      });
  }
}
