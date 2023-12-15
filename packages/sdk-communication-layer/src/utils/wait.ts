import { MAX_RPC_WAIT_TIME } from '../config';
import {
  RPCMethodCache,
  RPCMethodResult,
  SocketService,
} from '../SocketService';

export const wait = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const waitForRpc = async (
  rpcId: string,
  rpc: RPCMethodCache,
  interval = 200, // 200ms
): Promise<RPCMethodResult> => {
  let result;
  const startTime = Date.now();

  let hasTimedout = false;

  while (!hasTimedout) {
    const waitTime = Date.now() - startTime;
    hasTimedout = waitTime > MAX_RPC_WAIT_TIME;

    // console.debug(`Waiting for RPC ${rpcId}... (${waitTime}ms)`);
    result = rpc[rpcId];
    if (result.elapsedTime !== undefined) {
      return result;
    }
    await wait(interval);
  }
  throw new Error(`RPC ${rpcId} timed out`);
};

export const waitForNextRpcCall = async ({
  rpcId,
  instance,
}: {
  rpcId: string;
  instance: SocketService;
}) => {
  while (
    instance.state.lastRpcId === rpcId ||
    instance.state.lastRpcId === undefined
  ) {
    await wait(200);
  }
  return instance.state.lastRpcId;
};
