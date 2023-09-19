import crossFetch from 'cross-fetch';
import { rpcRequestHandler } from './RPCRequestHandler';

// Mocking crossFetch
jest.mock('cross-fetch');

describe('rpcRequestHandler', () => {
  let mockResponse: any;

  beforeEach(() => {
    // Reset the mock
    (crossFetch as jest.MockedFunction<typeof crossFetch>).mockReset();

    // Default mock implementation
    mockResponse = {
      json: jest.fn().mockResolvedValue({ someKey: 'someValue' }),
    };

    (crossFetch as jest.MockedFunction<typeof crossFetch>).mockResolvedValue(
      mockResponse,
    );
  });

  it('should call crossFetch with correct params', async () => {
    const params = {
      rpcEndpoint: 'https://test-endpoint.com',
      sdkInfo: 'testSDK',
      method: 'testMethod',
      params: ['param1', 'param2'],
    };

    await rpcRequestHandler(params);

    // Check if crossFetch was called with correct args
    expect(crossFetch).toHaveBeenCalledWith(
      params.rpcEndpoint,
      expect.objectContaining({
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          // You can enable the check for 'Metamask-Sdk-Info' once you decide to use it
          // 'Metamask-Sdk-Info': params.sdkInfo,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: params.method,
          params: params.params,
          id: 1, // This is the initial rpcId, it will increment on subsequent calls
        }),
      }),
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

  // Add other test cases as required, such as error handling, etc.
});
