import { RPCMethodCache, RPCMethodResult } from '../SocketService';
import { MAX_RPC_WAIT_TIME } from '../config';
import { waitForRpc } from './wait';

jest.mock('../config', () => ({
  MAX_RPC_WAIT_TIME: 1000, // Adjust this value to match your tests
}));

describe('waitForRpc', () => {
  let rpcCache: RPCMethodCache;
  let rpcId: string;

  afterEach(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    rpcId = 'uniqueRpcId';
    rpcCache = {};
  });

  it('resolves with the result when the RPC call is successful', async () => {
    const expectedResult: RPCMethodResult = {
      id: '123',
      timestamp: Date.now(),
      method: 'methodName',
      elapsedTime: 50,
    };
    rpcCache[rpcId] = expectedResult;

    const result = await waitForRpc(rpcId, rpcCache);
    expect(result).toStrictEqual(expectedResult);
  });

  it('waits for the result to be available and then resolves', async () => {
    // 'expectedResult' should include all properties from 'RPCMethodResult'
    const expectedResult: RPCMethodResult = {
      id: '123',
      timestamp: Date.now(), // Provide a timestamp
      method: 'testMethod', // Provide a method name
      elapsedTime: 50, // Include the elapsedTime
    };

    setTimeout(() => {
      rpcCache[rpcId] = expectedResult;
    }, 500);

    jest.advanceTimersByTime(500);

    const result = await waitForRpc(rpcId, rpcCache);
    expect(result).toStrictEqual(expectedResult);
  });

  it('rejects with an error if the RPC call times out', async () => {
    jest.advanceTimersByTime(MAX_RPC_WAIT_TIME + 1); // Ensure we go past the timeout

    let error: Error | null = null;
    try {
      await waitForRpc(rpcId, rpcCache);
    } catch (e) {
      error = e as Error; // Cast the caught object as an Error to ensure type safety
    }
    expect(error).toBeDefined();
  });
});
