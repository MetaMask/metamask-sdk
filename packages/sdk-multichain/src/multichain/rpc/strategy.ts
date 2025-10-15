/**
 * Defines the strategy the SDK will use to handle an incoming RPC request.
 * This provides a clear, high-level blueprint for the routing logic.
 */
export enum RpcHandlingStrategy {
	/**
	 * STRATEGY 1: The request MUST be sent to the user's wallet.
	 * Use for requests requiring cryptographic signing, user consent, or access to private wallet state.
	 * The SDK acts as a direct passthrough.
	 */
	DIRECT_PASSTHROUGH,

	/**
	 * STRATEGY 2: The request can be fulfilled by a generic RPC node.
	 * The SDK will intercept the call and route it to a configured RPC endpoint,
	 * avoiding any interaction with the user's wallet.
	 */
	INTERCEPT_AND_ROUTE_TO_RPC_NODE,

	/**
	 * STRATEGY 3: The SDK already holds the required information in its session state.
	 * It will intercept the call and respond directly without any network request,
	 * providing an instantaneous response.
	 */
	INTERCEPT_AND_RESPOND_FROM_SDK_STATE,
}

const PASSTHROUGH_METHODS = new Set([
	// Account Connection
	'eth_requestAccounts',
	'solana_requestAccounts',

	// Transaction & Signing Operations
	'eth_sendTransaction',
	'eth_signTransaction',
	'eth_sign',
	'personal_sign',
	'eth_signTypedData',
	'eth_signTypedData_v3',
	'eth_signTypedData_v4',
	'solana_signTransaction',
	'solana_signAllTransactions',
	'solana_signAndSendTransaction',
	'solana_signMessage',

	// Network & Wallet Management
	'wallet_addEthereumChain',
	'wallet_switchEthereumChain',
	'wallet_watchAsset',
	'wallet_requestPermissions',
	'wallet_revokePermissions',

	// Encryption
	'eth_getEncryptionPublicKey',
	'eth_decrypt',

	// Solana background wallet methods (still need wallet)
	'solana_getAccounts', // FIXME: are we sure we want to send this to the wallet?
]);

const RPC_NODE_METHODS = new Set([
	// EVM Methods
	'eth_blockNumber',
	'eth_getBalance',
	'eth_getCode',
	'eth_getStorageAt',
	'eth_getTransactionCount',
	'eth_getBlockByHash',
	'eth_getBlockByNumber',
	'eth_getTransactionByHash',
	'eth_getTransactionReceipt',
	'eth_getLogs',
	'eth_call',
	'eth_estimateGas',
	'eth_gasPrice',
	'eth_maxPriorityFeePerGas',
	'eth_feeHistory',
	'eth_sendRawTransaction',
	'eth_subscribe',
	'eth_unsubscribe',
	'net_version',
	'web3_clientVersion',

	// Solana Methods
	'getAccountInfo',
	'getBalance',
	'getBlock',
	'getBlockHeight',
	'getBlockProduction',
	'getBlockCommitment',
	'getBlocks',
	'getBlockTime',
	'getClusterNodes',
	'getEpochInfo',
	'getEpochSchedule',
	'getFeeForMessage',
	'getFirstAvailableBlock',
	'getGenesisHash',
	'getHealth',
	'getHighestSnapshotSlot',
	'getIdentity',
	'getInflationGovernor',
	'getInflationRate',
	'getInflationReward',
	'getLargestAccounts',
	'getLatestBlockhash',
	'getLeaderSchedule',
	'getMaxRetransmitSlot',
	'getMaxShredInsertSlot',
	'getMinimumBalanceForRentExemption',
	'getMultipleAccounts',
	'getProgramAccounts',
	'getRecentPerformanceSamples',
	'getRecentPrioritizationFees',
	'getSignaturesForAddress',
	'getSignatureStatuses',
	'getSlot',
	'getSlotLeader',
	'getSlotLeaders',
	'getStakeMinimumDelegation',
	'getSupply',
	'getTokenAccountBalance',
	'getTokenAccountsByDelegate',
	'getTokenAccountsByOwner',
	'getTokenLargestAccounts',
	'getTokenSupply',
	'getTransaction',
	'getTransactionCount',
	'getVersion',
	'getVoteAccounts',
	'isBlockhashValid',
	'minimumLedgerSlot',
	'requestAirdrop',
	'sendTransaction',
	'simulateTransaction',
]);

const SDK_STATE_METHODS = new Set([
	'eth_accounts',
	'eth_chainId',
	'wallet_getPermissions',
]);

/**
 * Encapsulates the logic for determining the handling strategy for a given RPC method.
 * The order of checks is intentional: State -> RPC Node -> Passthrough.
 *
 * @param method - The name of the RPC method (e.g., 'eth_accounts').
 * @returns The appropriate RpcHandlingStrategy.
 * @defaults {RpcHandlingStrategy.DIRECT_PASSTHROUGH} for any unknown method, ensuring maximum security.
 */
export function getRpcHandlingStrategy(method: string): RpcHandlingStrategy {
	if (PASSTHROUGH_METHODS.has(method)) {
		return RpcHandlingStrategy.DIRECT_PASSTHROUGH;
	}
	if (SDK_STATE_METHODS.has(method)) {
		return RpcHandlingStrategy.INTERCEPT_AND_RESPOND_FROM_SDK_STATE;
	}
	if (RPC_NODE_METHODS.has(method)) {
		return RpcHandlingStrategy.INTERCEPT_AND_ROUTE_TO_RPC_NODE;
	}
	// Any unknown methods will default to the safest strategy.
	return RpcHandlingStrategy.DIRECT_PASSTHROUGH;
}
