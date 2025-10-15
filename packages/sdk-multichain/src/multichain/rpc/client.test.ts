/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import * as t from 'vitest';
import {
	type InvokeMethodOptions,
	RPCInvokeMethodErr,
	type Scope,
} from '../../domain';
import type { RPCClient } from './client';

t.describe('RPCClient', () => {
	let mockTransport: any;
	let mockConfig: any;
	let rpcClient: RPCClient;
	let baseOptions: any;

	t.beforeEach(async () => {
		const clientModule = await import('./client');
		baseOptions = {
			scope: 'eip155:1' as Scope,
			request: {
				method: 'eth_sendTransaction',
				params: { to: '0x123', value: '0x100' },
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
		rpcClient = new clientModule.RPCClient(mockTransport, mockConfig);
		// Reset mocks
		mockTransport.request.mockClear();
	});

	t.afterEach(async () => {
		t.vi.clearAllMocks();
		t.vi.resetAllMocks();
	});


	t.describe('invokeMethod', () => {
		t.describe('strategy-based routing', () => {
			t.it('should use DIRECT_PASSTHROUGH strategy for eth_sendTransaction', async () => {
				const sendTxOptions: InvokeMethodOptions = {
					scope: 'eip155:1' as Scope,
					request: {
						method: 'eth_sendTransaction',
						params: { to: '0x123', value: '0x100' },
					},
				};
				mockTransport.request.mockResolvedValue({ result: '0xhash' });
				const result = await rpcClient.invokeMethod(sendTxOptions);

				t.expect(result).toBe('0xhash');
				t.expect(mockTransport.request).toHaveBeenCalledWith({
					method: 'wallet_invokeMethod',
					params: sendTxOptions,
				});
			});

			t.it('should use DIRECT_PASSTHROUGH strategy for personal_sign', async () => {
				const signOptions: InvokeMethodOptions = {
					scope: 'eip155:1' as Scope,
					request: {
						method: 'personal_sign',
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
			});

			t.it('should use DIRECT_PASSTHROUGH strategy for eth_requestAccounts', async () => {
				const requestAccountsOptions: InvokeMethodOptions = {
					scope: 'eip155:1' as Scope,
					request: {
						method: 'eth_requestAccounts',
						params: [],
					},
				};
				mockTransport.request.mockResolvedValue({ result: ['0xaccount'] });
				const result = await rpcClient.invokeMethod(requestAccountsOptions);

				t.expect(result).toEqual(['0xaccount']);
				t.expect(mockTransport.request).toHaveBeenCalledWith({
					method: 'wallet_invokeMethod',
					params: requestAccountsOptions,
				});
			});

			t.it('should use DIRECT_PASSTHROUGH strategy for wallet_switchEthereumChain', async () => {
				const switchChainOptions: InvokeMethodOptions = {
					scope: 'eip155:1' as Scope,
					request: {
						method: 'wallet_switchEthereumChain',
						params: [{ chainId: '0x89' }],
					},
				};
				mockTransport.request.mockResolvedValue({ result: null });
				const result = await rpcClient.invokeMethod(switchChainOptions);

				t.expect(result).toBeNull();
				t.expect(mockTransport.request).toHaveBeenCalledWith({
					method: 'wallet_invokeMethod',
					params: switchChainOptions,
				});
			});

			t.it('should fallback to DIRECT_PASSTHROUGH for unknown methods', async () => {
				const unknownOptions: InvokeMethodOptions = {
					scope: 'eip155:1' as Scope,
					request: {
						method: 'unknown_method',
						params: [],
					},
				};
				mockTransport.request.mockResolvedValue({ result: 'unknown_result' });
				const result = await rpcClient.invokeMethod(unknownOptions);

				t.expect(result).toBe('unknown_result');
				t.expect(mockTransport.request).toHaveBeenCalledWith({
					method: 'wallet_invokeMethod',
					params: unknownOptions,
				});
			});

			t.it('should throw RPCInvokeMethodErr when transport request fails', async () => {
				mockTransport.request.mockRejectedValue(new Error('Transport error'));

				await t.expect(rpcClient.invokeMethod(baseOptions)).rejects.toBeInstanceOf(RPCInvokeMethodErr);
				await t.expect(rpcClient.invokeMethod(baseOptions)).rejects.toThrow('Transport error');
			});

			t.it('should throw RPCInvokeMethodErr when response contains an error', async () => {
				mockTransport.request.mockResolvedValue({
					error: { code: -32603, message: 'Internal error' }
				});

				await t.expect(rpcClient.invokeMethod(baseOptions)).rejects.toBeInstanceOf(RPCInvokeMethodErr);
				await t.expect(rpcClient.invokeMethod(baseOptions)).rejects.toThrow('RPC Request failed with code -32603: Internal error');
			});
		});
	});
});
