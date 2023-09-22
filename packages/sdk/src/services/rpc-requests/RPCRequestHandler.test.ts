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
  json: jest.Mock<Promise<{ someKey: string }>>;
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

  // Add other test cases as required, such as error handling, etc.
});
