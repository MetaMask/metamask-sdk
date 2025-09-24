import type { CaipChainId } from '@metamask/utils';

export const FEATURED_NETWORKS = {
	'Ethereum Mainnet': 'eip155:1',
	'Linea Mainnet': 'eip155:59144',
	'Arbitrum One': 'eip155:42161',
	'Avalanche Network C-Chain': 'eip155:43114',
	'BNB Chain': 'eip155:56',
	'OP Mainnet': 'eip155:10',
	'Polygon Mainnet': 'eip155:137',
	'zkSync Era Mainnet': 'eip155:324',
	'Base Mainnet': 'eip155:8453',
	'Solana Mainnet': 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
} as const;

export const getNetworkName = (chainId: CaipChainId): string => {
	const entry = Object.entries(FEATURED_NETWORKS).find(([_, id]) => id === chainId);
	return entry ? entry[0] : chainId;
};
