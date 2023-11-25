import { EventType } from '../../../types/EventType';
import { SocketService } from '../../../SocketService';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { waitForNextRpcCall, waitForRpc } from '../../../utils/wait';

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
      ).then((result) => ({ type: 'rpcCheck', result }));

      // Check for missed rpc call which can happen on slow mobile to mobile connection.
      // In this case manually trigger an error.
      const checkForSkippedRpcPromise = (async () => {
        // wait for next rpc call to be sent and defined.
        const nextRpcId = await waitForNextRpcCall({ instance, rpcId });
        console.log(`current=${rpcId} ---> nextRpcId=${nextRpcId}`);

        const result = await waitForRpc(
          nextRpcId,
          instance.state.rpcMethodTracker,
          200,
        );
        // It means rpcId has been skipped!
        return { type: 'skippedRpc', result };
      })();

      const winner = await Promise.race([
        rpcCheckPromise,
        checkForSkippedRpcPromise,
      ]);

      if (winner.type === 'rpcCheck') {
        const rpcCheck = winner.result;
        console.debug(`AAAAAAAAAAAAAAAAAAAAA okokok`, rpcCheck);
        // rpcCheck resolved first, handle normally
        if (instance.state.debug) {
          console.debug(
            `SocketService::waitForRpc id=${message.id} ${method} ( ${rpcCheck.elapsedTime} ms)`,
            rpcCheck.result,
          );
        }
      } else if (winner.type === 'skippedRpc') {
        const { result } = winner;
        // set the rpc has timedout and error.
        console.error(
          `AAAAAAAAAAAAAAAAAAAAA RPC METHOD HAS BEEN SKIPPED rpcid=${rpcId} method=${method}`,
          result,
        );

        const rpcResult = {
          ...instance.state.rpcMethodTracker[rpcId],
          error: new Error('SKIPPED'),
        };
        instance.emit(EventType.RPC_UPDATE, rpcResult);

        // FIXME should also emit message event?
        // simulate wallet error message
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
    }
  }
}
