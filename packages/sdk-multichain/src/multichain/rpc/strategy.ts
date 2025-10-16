/**
 * Defines the strategy the SDK will use to handle an incoming RPC request.
 * This provides a clear, high-level blueprint for the routing logic.
 */
export enum RequestHandlingStrategy {
	/**
	 * STRATEGY 1: The request MUST be sent to the user's wallet.
	 * Use for requests requiring cryptographic signing, user consent, or access to private wallet state.
	 */
	WALLET,

	/**
	 * STRATEGY 2: The request can be fulfilled by a generic RPC node.
	 * The SDK will intercept the call and route it to a configured RPC endpoint,
	 * avoiding any interaction with the user's wallet.
	 */
	RPC,

	/**
	 * STRATEGY 3: The SDK already holds the required information in its session state.
	 * It will intercept the call and respond directly without any network request,
	 * providing an instantaneous response.
	 */
	SDK,
}

const RPC_HANDLED_METHODS = new Set([
	'eth_blockNumber',
	'eth_gasPrice',
	'eth_maxPriorityFeePerGas',
	'eth_blobBaseFee',
	'eth_feeHistory',
	'eth_getBalance',
	'eth_getCode',
	'eth_getStorageAt',
	'eth_call',
	'eth_estimateGas',
	'eth_getLogs',
	'eth_getProof',
	'eth_getTransactionCount',
	'eth_getBlockByNumber',
	'eth_getBlockByHash',
	'eth_getBlockTransactionCountByNumber',
	'eth_getBlockTransactionCountByHash',
	'eth_getUncleCountByBlockNumber',
	'eth_getUncleCountByBlockHash',
	'eth_getTransactionByHash',
	'eth_getTransactionByBlockNumberAndIndex',
	'eth_getTransactionByBlockHashAndIndex',
	'eth_getTransactionReceipt',
	'eth_getUncleByBlockNumberAndIndex',
	'eth_getUncleByBlockHashAndIndex',
	'eth_getFilterChanges',
	'eth_getFilterLogs',
	'eth_newBlockFilter',
	'eth_newFilter',
	'eth_newPendingTransactionFilter',
	'eth_sendRawTransaction',
	'eth_syncing',
	'eth_uninstallFilter',
	'web3_clientVersion',
]);

const SDK_HANDLED_METHODS = new Set([
	'eth_accounts',
	'eth_chainId',
]);

/**
 * Encapsulates the logic for determining the handling strategy for a given RPC method.
 * Methods handled by the "RPC strategy" can be handled by a separately instantiated rpcClient rather 
 * than having to roundtrip back to the wallet
 * Methods handled by the "SDK strategy" can be handled with wallet state that is cached in the SDK layer
 * All other methods need to go to the Wallet since they cannot be handled otherwise.
 *
 * @param method - The name of the RPC method (e.g., 'eth_accounts').
 * @returns The appropriate RequestHandlingStrategy.
 * @defaults {RequestHandlingStrategy.WALLET} for any unknown method.
 */
export function getRequestHandlingStrategy(method: string): RequestHandlingStrategy {
	if (RPC_HANDLED_METHODS.has(method)) {
		return RequestHandlingStrategy.RPC;
	}
	if (SDK_HANDLED_METHODS.has(method)) {
		return RequestHandlingStrategy.SDK;
	}
	// Any unknown methods will default to the safest strategy.
	return RequestHandlingStrategy.WALLET;
}
