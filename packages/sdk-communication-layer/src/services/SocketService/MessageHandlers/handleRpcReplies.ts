import { EventType } from '../../../types/EventType';
import { SocketService } from '../../../SocketService';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { waitForNextRpcCall, waitForRpc } from '../../../utils/wait';

const DEFAULT_SKIPPED_RPC_ERROR = 'SDK_CONNECTION_ISSUE';
enum PromiseType {
  RPC_CHECK = 'rpcCheck',
  SKIPPED_RPC = 'skippedRpc',
}

/**
 * Handles the waiting for RPC replies for the provided message.
 * If the instance is the originator of the message and the message has an associated RPC ID,
 * it waits for the corresponding RPC reply using the `waitForRpc` utility function.
 * When the reply is received, it logs debug information about the RPC reply.
 *
 * @param instance The current instance of the SocketService.
 * @param message The message for which to handle RPC replies.
 */
export async function handleRpcReplies(
  instance: SocketService,
  message: CommunicationLayerMessage,
) {
  const rpcId = message?.id;
  const method = message?.method ?? '';

  if (instance.state.isOriginator && rpcId) {
    try {
      const rpcCheckPromise = waitForRpc(
        rpcId,
        instance.state.rpcMethodTracker,
        200,
      ).then((result) => ({ type: PromiseType.RPC_CHECK, result }));

      // Check for missed rpc calls which could historically happen on older wallet version.
      // In this case manually trigger an error.
      const checkForSkippedRpcPromise = (async () => {
        // wait for next rpc call to be sent and defined.
        const nextRpcId = await waitForNextRpcCall({ instance, rpcId });
        const result = await waitForRpc(
          nextRpcId,
          instance.state.rpcMethodTracker,
          200,
        );
        // If it returns before a previous rpc calls, it means the previous one was skipped.
        return { type: PromiseType.SKIPPED_RPC, result };
      })();

      const winner = await Promise.race([
        rpcCheckPromise,
        checkForSkippedRpcPromise,
      ]);

      if (winner.type === PromiseType.RPC_CHECK) {
        const rpcCheck = winner.result;
        // rpcCheck resolved first, handle normally
        if (instance.state.debug) {
          console.debug(
            `SocketService::waitForRpc id=${message.id} ${method} ( ${rpcCheck.elapsedTime} ms)`,
            rpcCheck.result,
          );
        }
      } else if (winner.type === PromiseType.SKIPPED_RPC) {
        const { result } = winner;
        // set the rpc has timedout and error.
        console.warn(
          `[handleRpcReplies] RPC METHOD HAS BEEN SKIPPED rpcid=${rpcId} method=${method}`,
          result,
        );

        const rpcResult = {
          ...instance.state.rpcMethodTracker[rpcId],
          error: new Error(DEFAULT_SKIPPED_RPC_ERROR),
        };
        instance.emit(EventType.RPC_UPDATE, rpcResult);

        // simulate wallet error message if a message was skipped.
        const errorMessage = {
          data: { ...rpcResult, jsonrpc: '2.0' },
          name: 'metamask-provider',
        };
        instance.emit(EventType.MESSAGE, { message: errorMessage });
      } else {
        throw new Error(`Error handling RPC replies for ${rpcId}`);
      }
    } catch (err) {
      console.warn(`Error rpcId=${message.id} ${method}`, err);
      throw err;
    }
  }
}
