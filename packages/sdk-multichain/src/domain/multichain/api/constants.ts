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

export const RPC_HANDLED_METHODS = new Set([
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

export const SDK_HANDLED_METHODS = new Set(['eth_accounts', 'eth_chainId']);
