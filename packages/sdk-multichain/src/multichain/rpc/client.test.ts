/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import * as t from 'vitest';
import { vi } from 'vitest';
import {
	type InvokeMethodOptions,
	type MultichainOptions,
	RPC_METHODS,
	RPCHttpErr,
	RPCInvokeMethodErr,
	RPCReadonlyRequestErr,
	RPCReadonlyResponseErr,
	type Scope,
} from '../../domain';
import type { RPCClient } from './client';

// Mock cross-fetch with proper implementation
vi.mock('cross-fetch', () => {
	const mockFetch = vi.fn();
	return {
		default: mockFetch,
		__mockFetch: mockFetch,
	};
});

// Mock the entire client module
vi.mock('./client', async () => {
	const actual = await vi.importActual('./client');
	return {
		...actual,
	};
});

t.describe('RPCClient', () => {
	let mockTransport: any;
	let mockConfig: any;
	let sdkInfo: string;
	let rpcClient: RPCClient;
	let rpcClientModule: typeof RPCClient;
	let defaultHeaders: Record<string, string>;
	let headers: Record<string, string>;
	let mockFetch: any;
	let baseOptions: any;

	t.beforeEach(async () => {
		const clientModule = await import('./client');
		baseOptions = {
			scope: 'eip155:1' as Scope,
			request: {
				method: 'eth_getBalance',
				params: { address: '0x123', blockNumber: 'latest' },
			},
		};
		mockTransport = {
			request: t.vi.fn(),
		};
		mockConfig = {
			api: {
				infuraAPIKey: 'test-infura-key',
				readonlyRPCMap: {
					'eip155:1': 'https://custom-mainnet.com',
				},
			},
		};
		sdkInfo = 'Sdk/Javascript SdkVersion/1.0.0 Platform/web';
		rpcClient = new clientModule.RPCClient(mockTransport, mockConfig, sdkInfo);
		rpcClientModule = clientModule.RPCClient;
		// Get mock fetch from the module mock
		const fetchModule = await import('cross-fetch');
		mockFetch = (fetchModule as any).__mockFetch;
		// Reset mocks
		mockTransport.request.mockClear();
		mockFetch.mockClear();
		defaultHeaders = {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		};
		headers = {
			...defaultHeaders,
			'Metamask-Sdk-Info': sdkInfo,
		};
	});

	t.afterEach(async () => {
		t.vi.clearAllMocks();
		t.vi.resetAllMocks();
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
			const currentHeaders = (rpcClient as any).getHeaders(infuraEndpoint);
			t.expect(currentHeaders).toEqual(headers);
		});
	});

	t.describe('invokeMethod', () => {
		t.describe('redirect to provider cases', () => {
			t.it('should not redirect to provider for readonly methods', async () => {
				// Mock successful fetch response
				const mockJsonResponse = {
					jsonrpc: '2.0',
					result: '0x1234567890abcdef',
					id: 1,
				};

				const mockResponse = {
					ok: true,
					json: t.vi.fn().mockResolvedValue(mockJsonResponse),
				};

				mockFetch.mockResolvedValue(mockResponse);

				const result = await rpcClient.invokeMethod(baseOptions);

				t.expect(result).toBe('0x1234567890abcdef');
				t.expect(mockTransport.request).not.toHaveBeenCalled();
				t.expect(mockFetch).toHaveBeenCalledWith('https://mainnet.infura.io/v3/test-infura-key', {
					method: 'POST',
					headers: headers,
					body: t.expect.stringContaining('"method":"eth_getBalance"'),
				});
				t.expect(mockResponse.json).toHaveBeenCalled();
			});

			t.it('should throw RPCReadonlyResponseErr when response cannot be parsed as JSON', async () => {
				const mockResponse = {
					ok: true,
					json: t.vi.fn().mockRejectedValue(new Error('Invalid JSON')),
				};

				mockFetch.mockResolvedValue(mockResponse);

				await t.expect(rpcClient.invokeMethod(baseOptions)).rejects.toBeInstanceOf(RPCReadonlyResponseErr);
				await t.expect(rpcClient.invokeMethod(baseOptions)).rejects.toThrow('Invalid JSON');
			});

			t.it('should throw RPCHttpErr when fetch response is not ok', async () => {
				const mockResponse = {
					ok: false,
					status: 500,
				};

				mockFetch.mockResolvedValue(mockResponse);

				await t.expect(rpcClient.invokeMethod(baseOptions)).rejects.toBeInstanceOf(RPCHttpErr);
			});

			t.it('should throw RPCReadonlyRequestErr when fetch throws', async () => {
				const fetchError = new Error('Network error');
				mockFetch.mockRejectedValue(fetchError);

				await t.expect(rpcClient.invokeMethod(baseOptions)).rejects.toBeInstanceOf(RPCReadonlyRequestErr);
				await t.expect(rpcClient.invokeMethod(baseOptions)).rejects.toThrow('Network error');
			});

			t.it('should use only Infura URLs when readonlyRPCMapConfig is not provided', async () => {
				const configWithoutRPCMap = {
					api: {
						infuraAPIKey: 'test-infura-key',
						// No readonlyRPCMap provided
					},
				} as any;
				const clientWithoutRPCMap = new rpcClientModule(mockTransport, configWithoutRPCMap, sdkInfo);

				const mockJsonResponse = {
					jsonrpc: '2.0',
					result: '0xabcdef123456',
					id: 1,
				};

				const mockResponse = {
					ok: true,
					json: t.vi.fn().mockResolvedValue(mockJsonResponse),
				};

				mockFetch.mockResolvedValue(mockResponse);

				const result = await clientWithoutRPCMap.invokeMethod(baseOptions);

				t.expect(result).toBe('0xabcdef123456');
				t.expect(mockTransport.request).not.toHaveBeenCalled();

				// Should still use Infura URL since infuraAPIKey is provided
				t.expect(mockFetch).toHaveBeenCalledWith('https://mainnet.infura.io/v3/test-infura-key', {
					method: 'POST',
					headers: headers,
					body: t.expect.stringMatching('"method":"eth_getBalance"'),
				});
			});

			t.it('should use only default headers when RPC endpoint does not include infura and custom readonly RPC is provided', async () => {
				const configWithCustomRPC = {
					api: {
						readonlyRPCMap: {
							'eip155:1': 'https://custom-ethereum-node.com/rpc',
						},
					},
				} as any;
				const clientWithCustomRPC = new rpcClientModule(mockTransport, configWithCustomRPC, sdkInfo);
				const mockJsonResponse = {
					jsonrpc: '2.0',
					result: '0x123456account12345',
					id: 1,
				};
				const mockResponse = {
					ok: true,
					json: t.vi.fn().mockResolvedValue(mockJsonResponse),
				};

				mockFetch.mockResolvedValue(mockResponse);
				baseOptions.request = {
					method: 'eth_accounts',
					params: undefined,
				};

				const result = await clientWithCustomRPC.invokeMethod(baseOptions);
				t.expect(result).toBe('0x123456account12345');
				t.expect(mockTransport.request).not.toHaveBeenCalled();
				t.expect(mockFetch).toHaveBeenCalledWith('https://custom-ethereum-node.com/rpc', {
					method: 'POST',
					headers: defaultHeaders,
					body: t.expect.stringMatching(/^\{"jsonrpc":"2\.0","method":"eth_accounts","id":\d+\}$/),
				});
			});

			t.it('should redirect to provider for methods in METHODS_TO_REDIRECT', async () => {
				const redirectOptions: InvokeMethodOptions = {
					scope: 'eip155:1' as Scope,
					request: {
						method: RPC_METHODS.ETH_SENDTRANSACTION,
						params: { to: '0x123', value: '0x100' },
					},
				};
				mockTransport.request.mockResolvedValue({ result: '0xhash' });
				const result = await rpcClient.invokeMethod(redirectOptions);
				t.expect(result).toBe('0xhash');
				t.expect(mockTransport.request).toHaveBeenCalledWith({
					method: 'wallet_invokeMethod',
					params: redirectOptions,
				});
				t.expect(mockFetch).not.toHaveBeenCalled();
			});

			t.it('should redirect to provider for personal_sign method', async () => {
				const signOptions: InvokeMethodOptions = {
					scope: 'eip155:1' as Scope,
					request: {
						method: RPC_METHODS.PERSONAL_SIGN,
						params: { message: 'hello world' },
					},
				};
				mockTransport.request.mockResolvedValue({ result: '0xsignature' });
				const result = await rpcClient.invokeMethod(signOptions);
				t.expect(result).toBe('0xsignature');
				t.expect(mockTransport.request).toHaveBeenCalledWith({
					method: 'wallet_invokeMethod',
					params: signOptions,
				});
				t.expect(mockFetch).not.toHaveBeenCalled();
			});

			t.it('should redirect to provider when no RPC endpoint is available', async () => {
				const noRpcOptions: InvokeMethodOptions = {
					scope: 'eip155:999' as Scope, // Unknown chain
					request: {
						method: 'eth_getBalance',
						params: { address: '0x123', blockNumber: 'latest' },
					},
				};
				mockTransport.request.mockResolvedValue({ result: '0xbalance' });
				const result = await rpcClient.invokeMethod(noRpcOptions);
				t.expect(result).toBe('0xbalance');
				t.expect(mockTransport.request).toHaveBeenCalledWith({
					method: 'wallet_invokeMethod',
					params: noRpcOptions,
				});
				t.expect(mockFetch).not.toHaveBeenCalled();
			});

			t.it('should redirect to provider when no infura API key and no custom RPC map', async () => {
				const noConfigClient = new rpcClientModule(mockTransport, {} as any, sdkInfo);
				mockTransport.request.mockResolvedValue({ result: '0xfallback' });
				const result = await noConfigClient.invokeMethod(baseOptions);
				t.expect(result).toBe('0xfallback');
				t.expect(mockTransport.request).toHaveBeenCalledWith({
					method: 'wallet_invokeMethod',
					params: baseOptions,
				});
				t.expect(mockFetch).not.toHaveBeenCalled();
			});

			t.it('should throw RPCInvokeMethodErr when provider throws', async () => {
				const redirectOptions: InvokeMethodOptions = {
					scope: 'eip155:1' as Scope,
					request: {
						method: RPC_METHODS.ETH_SENDTRANSACTION,
						params: { to: '0x123', value: '0x100' },
					},
				};
				mockTransport.request.mockRejectedValue(new Error('Provider error'));
				await t.expect(rpcClient.invokeMethod(redirectOptions)).rejects.toBeInstanceOf(RPCInvokeMethodErr);
				t.expect(mockFetch).not.toHaveBeenCalled();
			});
		});
	});
});
