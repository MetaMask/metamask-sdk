import crossFetch from 'cross-fetch';
import { rpcRequestHandler } from './RPCRequestHandler';

// Mocking crossFetch
jest.mock('cross-fetch');

// Mock getNextRpcId to always return 1
jest.mock('./RPCRequestHandler', () => {
  const originalModule = jest.requireActual('./RPCRequestHandler');

  return {
    ...originalModule,
    getNextRpcId: jest.fn(() => 1), // Always return 1 during testing
  };
});

interface MockResponse {
  ok: boolean;
  json: jest.Mock<Promise<unknown>>;
  status: number;
}

describe('rpcRequestHandler', () => {
  let mockResponse: MockResponse;

  beforeEach(() => {
    // Reset the mock and rpcId
    (crossFetch as jest.MockedFunction<typeof crossFetch>).mockReset();

    mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        id: 1, // Since the mocked getNextRpcId always returns 1
        jsonrpc: '2.0',
        result: { someKey: 'someValue' },
      }),
      status: 200,
    };

    (crossFetch as jest.MockedFunction<typeof crossFetch>).mockResolvedValue(
      mockResponse as any,
    );
  });

  it('should return correct output', async () => {
    const params = {
      rpcEndpoint: 'https://test-endpoint.com',
      sdkInfo: 'testSDK',
      method: 'testMethod',
      params: ['param1', 'param2'],
    };

    const result = await rpcRequestHandler(params);

    // Check if correct result is returned
    expect(result).toStrictEqual({ someKey: 'someValue' });
  });

  it('should include Metamask-Sdk-Info header if endpoint includes "infura"', async () => {
    const params = {
      rpcEndpoint: 'https://infura.io/test-endpoint',
      sdkInfo: 'testSDK',
      method: 'testMethod',
      params: ['param1', 'param2'],
    };

    await rpcRequestHandler(params);

    // Check if crossFetch was called with the correct headers
    expect(crossFetch).toHaveBeenCalledWith(
      'https://infura.io/test-endpoint',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Metamask-Sdk-Info': 'testSDK',
        }),
      }),
    );
  });

  it('should not include Metamask-Sdk-Info header if endpoint does not include "infura"', async () => {
    const params = {
      rpcEndpoint: 'https://test-endpoint.com',
      sdkInfo: 'testSDK',
      method: 'testMethod',
      params: ['param1', 'param2'],
    };

    await rpcRequestHandler(params);

    // Check if crossFetch was called with the correct headers
    expect(crossFetch).toHaveBeenCalledWith(
      'https://test-endpoint.com',
      expect.objectContaining({
        headers: expect.not.objectContaining({
          'Metamask-Sdk-Info': 'testSDK',
        }),
      }),
    );
  });

  it('should throw an error if fetch fails', async () => {
    (
      crossFetch as jest.MockedFunction<typeof crossFetch>
    ).mockRejectedValueOnce(new Error('Fetch error'));

    const params = {
      rpcEndpoint: 'https://test-endpoint.com',
      sdkInfo: 'testSDK',
      method: 'testMethod',
      params: ['param1', 'param2'],
    };

    await expect(rpcRequestHandler(params)).rejects.toThrow(
      'Failed to fetch from RPC: Fetch error',
    );
  });

  it('should throw an error if response is not ok', async () => {
    mockResponse.ok = false;
    mockResponse.status = 500;

    const params = {
      rpcEndpoint: 'https://test-endpoint.com',
      sdkInfo: 'testSDK',
      method: 'testMethod',
      params: ['param1', 'param2'],
    };

    await expect(rpcRequestHandler(params)).rejects.toThrow(
      'Server responded with a status of 500',
    );
  });
});
