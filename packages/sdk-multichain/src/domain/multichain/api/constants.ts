/* c8 ignore start */
import type { RpcUrlsMap } from './types';

export const infuraRpcUrls: RpcUrlsMap = {
	// ###### Ethereum ######
	// Mainnet
	'eip155:1': 'https://mainnet.infura.io/v3/',
	// Goerli
	'eip155:5': 'https://goerli.infura.io/v3/',
	// Sepolia 11155111
	'eip155:11155111': 'https://sepolia.infura.io/v3/',
	// ###### Linea ######
	// Mainnet Alpha
	'eip155:59144': 'https://linea-mainnet.infura.io/v3/',
	// Testnet ( linea goerli )
	'eip155:59140': 'https://linea-goerli.infura.io/v3/',
	// ###### Polygon ######
	// Mainnet
	'eip155:137': 'https://polygon-mainnet.infura.io/v3/',
	// Mumbai
	'eip155:80001': 'https://polygon-mumbai.infura.io/v3/',
	// ###### Optimism ######
	// Mainnet
	'eip155:10': 'https://optimism-mainnet.infura.io/v3/',
	// Goerli
	'eip155:420': 'https://optimism-goerli.infura.io/v3/',
	// ###### Arbitrum ######
	// Mainnet
	'eip155:42161': 'https://arbitrum-mainnet.infura.io/v3/',
	// Goerli
	'eip155:421613': 'https://arbitrum-goerli.infura.io/v3/',
	// ###### Palm ######
	// Mainnet
	'eip155:11297108109': 'https://palm-mainnet.infura.io/v3/',
	// Testnet
	'eip155:11297108099': 'https://palm-testnet.infura.io/v3/',
	// ###### Avalanche C-Chain ######
	// Mainnet
	'eip155:43114': 'https://avalanche-mainnet.infura.io/v3/',
	// Fuji
	'eip155:43113': 'https://avalanche-fuji.infura.io/v3/',
	// // ###### NEAR ######
	// // Mainnet
	// 'near:mainnet': `https://near-mainnet.infura.io/v3/`,
	// // Testnet
	// 'near:testnet': `https://near-testnet.infura.io/v3/`,
	// ###### Aurora ######
	// Mainnet
	'eip155:1313161554': 'https://aurora-mainnet.infura.io/v3/',
	// Testnet
	'eip155:1313161555': 'https://aurora-testnet.infura.io/v3/',
	// ###### StarkNet ######
	// Mainnet
	//
	// 'starknet:SN_MAIN': `https://starknet-mainnet.infura.io/v3/`,
	// // Goerli
	// 'starknet:SN_GOERLI': `https://starknet-goerli.infura.io/v3/`,
	// // Goerli 2
	// 'starknet:SN_GOERLI2': `https://starknet-goerli2.infura.io/v3/`,
	// ###### Celo ######
	// Mainnet
	'eip155:42220': 'https://celo-mainnet.infura.io/v3/',
	// Alfajores Testnet
	'eip155:44787': 'https://celo-alfajores.infura.io/v3/',
};

/**
 * Standard RPC method names used in the MetaMask ecosystem.
 *
 * This constant provides a centralized registry of all supported
 * RPC methods, making it easier to reference them consistently
 * throughout the codebase.
 */
export const RPC_METHODS = {
	/** Get the current provider state */
	METAMASK_GETPROVIDERSTATE: 'metamask_getProviderState',
	/** Connect and sign in a single operation */
	METAMASK_CONNECTSIGN: 'metamask_connectSign',
	/** Connect with specific parameters */
	METAMASK_CONNECTWITH: 'metamask_connectWith',
	/** Open MetaMask interface */
	METAMASK_OPEN: 'metamask_open',
	/** Execute multiple operations in a batch */
	METAMASK_BATCH: 'metamask_batch',
	/** Sign a message with personal_sign */
	PERSONAL_SIGN: 'personal_sign',
	/** Request wallet permissions */
	WALLET_REQUESTPERMISSIONS: 'wallet_requestPermissions',
	/** Revoke wallet permissions */
	WALLET_REVOKEPERMISSIONS: 'wallet_revokePermissions',
	/** Get current wallet permissions */
	WALLET_GETPERMISSIONS: 'wallet_getPermissions',
	/** Watch/add a token to the wallet */
	WALLET_WATCHASSET: 'wallet_watchAsset',
	/** Add a new Ethereum chain */
	WALLET_ADDETHEREUMCHAIN: 'wallet_addEthereumChain',
	/** Switch to a different Ethereum chain */
	WALLET_SWITCHETHEREUMCHAIN: 'wallet_switchEthereumChain',
	/** Request account access */
	ETH_REQUESTACCOUNTS: 'eth_requestAccounts',
	/** Get available accounts */
	ETH_ACCOUNTS: 'eth_accounts',
	/** Get current chain ID */
	ETH_CHAINID: 'eth_chainId',
	/** Send a transaction */
	ETH_SENDTRANSACTION: 'eth_sendTransaction',
	/** Sign typed data */
	ETH_SIGNTYPEDDATA: 'eth_signTypedData',
	/** Sign typed data v3 */
	ETH_SIGNTYPEDDATA_V3: 'eth_signTypedData_v3',
	/** Sign typed data v4 */
	ETH_SIGNTYPEDDATA_V4: 'eth_signTypedData_v4',
	/** Sign a transaction */
	ETH_SIGNTRANSACTION: 'eth_signTransaction',
	/** Sign arbitrary data */
	ETH_SIGN: 'eth_sign',
	/** Recover address from signature */
	PERSONAL_EC_RECOVER: 'personal_ecRecover',
};

/**
 * Configuration mapping for EVM RPC methods that should be passed through to the provider.
 *
 * This constant defines which EVM RPC methods do not require user interaction through
 * the wallet interface. Methods listed here will not redirect to the wallet for user approval.
 */

export const EVM_RPC_PASSTHROUGH_METHODS = [
	'eth_chainId', // cached
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
	'eth_accounts', // cached
	'eth_coinbase', // cached, but shouldn't be callable via multichain-api
	'eth_getFilterChanges',
	'eth_getFilterLogs',
	'eth_newBlockFilter',
	'eth_newFilter',
	'eth_newPendingTransactionFilter',
	'eth_sendRawTransaction',
	'eth_subscribe',
	'eth_syncing',
	'eth_uninstallFilter',
	'eth_unsubscribe',
	'web3_clientVersion',
];
