import { RPCMethodCache, RPCMethodResult } from '../SocketService';

export const wait = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const waitForRpc = async (
  rpcId: string,
  rpc: RPCMethodCache,
  timeout = 200, // 200ms
): Promise<RPCMethodResult> => {
  let result;
  while (!result) {
    result = rpc[rpcId];
    if (result.elapsedTime !== undefined) {
      return result;
    }
    await wait(timeout);
  }
  return result;
};
