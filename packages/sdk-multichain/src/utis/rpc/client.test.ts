import * as t from 'vitest';

import {
  MultichainSDKConstructor,
  type InvokeMethodOptions,
  type Scope,
  RPC_METHODS,
  RPCInvokeMethodErr,
  RPCReadonlyResponseErr,
} from '../../domain';
import { RPCClient, getNextRpcId } from './client';

t.describe('RPCClient', () => {
  let mockProvider: any;
  let mockConfig: MultichainSDKConstructor['api'];
  let sdkInfo: string;
  let rpcClient: RPCClient;
  let defaultHeaders: Record<string, string>;
  let headers: Record<string, string>;

  t.beforeEach(() => {
    mockProvider = {
      invokeMethod: t.vi.fn(),
    };
    mockConfig = {
      infuraAPIKey: 'test-infura-key',
      readonlyRPCMap: {
        'eip155:1': 'https://custom-mainnet.com',
      },
    };
    sdkInfo = 'Sdk/Javascript SdkVersion/1.0.0 Platform/web';
    rpcClient = new RPCClient(mockProvider, mockConfig, sdkInfo);
    // Reset mocks
    mockProvider.invokeMethod.mockClear();
    defaultHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
    headers = {
      ...defaultHeaders,
        'Metamask-Sdk-Info': sdkInfo,
    }
  });

  t.describe('getNextRpcId', () => {
    t.it('should increment and return RPC ID', () => {
      const id1 = getNextRpcId();
      const id2 = getNextRpcId();
      t.expect(id2).toBeGreaterThan(id1);
      t.expect(id2).toBe(id1 + 1);
    });
  });

  t.describe('getHeaders', () => {
    t.it('should return default headers when RPC endpoint does not include infura', () => {
      const customRpcEndpoint = 'https://custom-ethereum-node.com/rpc';
      const headers = (rpcClient as any).getHeaders(customRpcEndpoint);

      t.expect(headers).toEqual(defaultHeaders);
      t.expect(headers).not.toHaveProperty('Metamask-Sdk-Info');
    });

    t.it('should return headers with Metamask-Sdk-Info when RPC endpoint includes infura', () => {
      const infuraEndpoint = 'https://mainnet.infura.io/v3/test-key';
      const headers = (rpcClient as any).getHeaders(infuraEndpoint);

      t.expect(headers).toEqual(headers);
    });
  });

  t.describe('invokeMethod', () => {
    const baseOptions: InvokeMethodOptions = {
      scope: 'eip155:1' as Scope,
      request: {
        method: 'eth_getBalance',
        params: { address: '0x123', blockNumber: 'latest' },
      },
    };

    t.describe('redirect to provider cases', () => {
      t.it('should not redirect to provider for readonly methods', async () => {

        // Mock the private fetch method
        const mockJsonResponse = {
          jsonrpc: '2.0',
          result: '0x1234567890abcdef',
          id: 1,
        };

        const mockResponse = {
          ok: true,
          json: t.vi.fn().mockResolvedValue(mockJsonResponse),

        };

        const fetchSpy = t.vi.spyOn(rpcClient as any, 'fetch').mockResolvedValue(mockResponse);

        const result = await rpcClient.invokeMethod(baseOptions);

        t.expect(result).toBe('0x1234567890abcdef');
        t.expect(mockProvider.invokeMethod).not.toHaveBeenCalled();
        t.expect(fetchSpy).toHaveBeenCalledWith(
          'https://mainnet.infura.io/v3/test-infura-key',
          t.expect.stringContaining('"method":"eth_getBalance"'),
          'POST',
          t.expect.objectContaining(headers)
        );
        t.expect(mockResponse.json).toHaveBeenCalled();

        fetchSpy.mockRestore();
      });

      t.it('should throw RPCReadonlyResponseErr when response cannot be parsed as JSON', async () => {
        const mockResponse = {
          ok: true,
          json: t.vi.fn().mockRejectedValue(new Error('Invalid JSON')),
        };

        const fetchSpy = t.vi.spyOn(rpcClient as any, 'fetch').mockResolvedValue(mockResponse);

        await t.expect(rpcClient.invokeMethod(baseOptions)).rejects.toBeInstanceOf(RPCReadonlyResponseErr);
        await t.expect(rpcClient.invokeMethod(baseOptions)).rejects.toThrow('Invalid JSON');

        fetchSpy.mockRestore();
      });

      t.it('should use only Infura URLs when readonlyRPCMapConfig is not provided', async () => {
        const configWithoutRPCMap = {
          infuraAPIKey: 'test-infura-key',
          // No readonlyRPCMap provided
        };
        const clientWithoutRPCMap = new RPCClient(mockProvider, configWithoutRPCMap, sdkInfo);

        const mockJsonResponse = {
          jsonrpc: '2.0',
          result: '0xabcdef123456',
          id: 1,
        };

        const mockResponse = {
          ok: true,
          json: t.vi.fn().mockResolvedValue(mockJsonResponse),
        };

        const fetchSpy = t.vi.spyOn(clientWithoutRPCMap as any, 'fetch').mockResolvedValue(mockResponse);

        const result = await clientWithoutRPCMap.invokeMethod(baseOptions);

        t.expect(result).toBe('0xabcdef123456');
        t.expect(mockProvider.invokeMethod).not.toHaveBeenCalled();

        // Should still use Infura URL since infuraAPIKey is provided
        t.expect(fetchSpy).toHaveBeenCalledWith(
          'https://mainnet.infura.io/v3/test-infura-key',
          t.expect.stringMatching('"method":"eth_getBalance"'),
          'POST',
          t.expect.objectContaining(headers)
        );

        fetchSpy.mockRestore();
      });

      t.it('should use only default headers when RPC endpoint does not include infura', async () => {
        const configWithCustomRPC = {
          readonlyRPCMap: {
            'eip155:1': 'https://custom-ethereum-node.com/rpc',
          },
        };
        const clientWithCustomRPC = new RPCClient(mockProvider, configWithCustomRPC, sdkInfo);

        const mockJsonResponse =  {
          jsonrpc: '2.0',
          result: '0xbalance123',
          id: 1,
        }

        mockProvider.invokeMethod.mockResolvedValue(mockJsonResponse);
        const fetchSpy = t.vi.spyOn(clientWithCustomRPC as any, 'fetch')
        const result = await clientWithCustomRPC.invokeMethod(baseOptions);

        t.expect(result).toBe(mockJsonResponse);
        t.expect(mockProvider.invokeMethod).toHaveBeenCalled();
        t.expect( mockProvider.invokeMethod).toHaveBeenCalledWith(baseOptions);
        t.expect(fetchSpy).not.toHaveBeenCalled();
      });

      t.it('should redirect to provider for methods in METHODS_TO_REDIRECT', async () => {
        const redirectOptions: InvokeMethodOptions = {
          scope: 'eip155:1' as Scope,
          request: {
            method: RPC_METHODS.ETH_SENDTRANSACTION,
            params: { to: '0x123', value: '0x100' },
          },
        };

        mockProvider.invokeMethod.mockResolvedValue('0xhash');

        const result = await rpcClient.invokeMethod(redirectOptions);

        t.expect(result).toBe('0xhash');
        t.expect(mockProvider.invokeMethod).toHaveBeenCalledWith(redirectOptions);
      });

      t.it('should redirect to provider for personal_sign method', async () => {
        const signOptions: InvokeMethodOptions = {
          scope: 'eip155:1' as Scope,
          request: {
            method: RPC_METHODS.PERSONAL_SIGN,
            params: { message: 'hello world' },
          },
        };

        mockProvider.invokeMethod.mockResolvedValue('0xsignature');

        const result = await rpcClient.invokeMethod(signOptions);

        t.expect(result).toBe('0xsignature');
        t.expect(mockProvider.invokeMethod).toHaveBeenCalledWith(signOptions);
      });

      t.it('should redirect to provider when no RPC endpoint is available', async () => {
        const noRpcOptions: InvokeMethodOptions = {
          scope: 'eip155:999' as Scope, // Unknown chain
          request: {
            method: 'eth_getBalance',
            params: { address: '0x123', blockNumber: 'latest' },
          },
        };

        mockProvider.invokeMethod.mockResolvedValue('0xbalance');

        const result = await rpcClient.invokeMethod(noRpcOptions);

        t.expect(result).toBe('0xbalance');
        t.expect(mockProvider.invokeMethod).toHaveBeenCalledWith(noRpcOptions);
      });

      t.it('should redirect to provider when no infura API key and no custom RPC map', async () => {
        const noConfigClient = new RPCClient(mockProvider, {}, sdkInfo);

        mockProvider.invokeMethod.mockResolvedValue('0xfallback');

        const result = await noConfigClient.invokeMethod(baseOptions);

        t.expect(result).toBe('0xfallback');
        t.expect(mockProvider.invokeMethod).toHaveBeenCalledWith(baseOptions);
      });

      t.it('should throw RPCInvokeMethodErr when provider throws', async () => {
        const redirectOptions: InvokeMethodOptions = {
          scope: 'eip155:1' as Scope,
          request: {
            method: RPC_METHODS.ETH_SENDTRANSACTION,
            params: { to: '0x123', value: '0x100' },
          },
        };
        mockProvider.invokeMethod.mockRejectedValue(new Error('Provider error'));
        await t.expect(rpcClient.invokeMethod(redirectOptions)).rejects.toBeInstanceOf(RPCInvokeMethodErr);
      });
    });
  });
});
