import { Transaction, PublicKey, SystemProgram, Connection } from '@solana/web3.js';
import type { Commitment } from '@solana/web3.js';

import { FEATURED_NETWORKS } from '../constants/networks';

const SOLANA_RPC_CONFIG = {
	endpoints: [
		...(process.env.EXPO_PUBLIC_HELIUS_API_KEY ? [`https://api.helius-rpc.com/?api-key=${process.env.EXPO_PUBLIC_HELIUS_API_KEY}`] : []),
		'https://api.devnet.solana.com',
		'https://api.mainnet-beta.solana.com',
	],
	commitment: 'confirmed' as Commitment,
	fallbackBlockhash: 'EETubP5AKHgjPAhzPAFcb8BAY1hMH639CWCFTqi3hq1k',
};

const generateBase64Transaction = async (address: string) => {
	const publicKey = new PublicKey(address);
	// biome-ignore lint/suspicious/noExplicitAny: Needed
	let blockhash: any;
	// biome-ignore lint/suspicious/noExplicitAny: Needed
	let error: any;

	for (const endpoint of SOLANA_RPC_CONFIG.endpoints) {
		try {
			const connection = new Connection(endpoint, SOLANA_RPC_CONFIG.commitment);
			const response = await connection.getLatestBlockhash();
			blockhash = response.blockhash;
			console.log(`Successfully connected to Solana RPC endpoint`);
			break;
		} catch (connectionError) {
			console.error(`Failed to connect to RPC endpoint:`, connectionError);
			error = connectionError;
		}
	}

	if (!blockhash) {
		console.warn('All RPC endpoints failed, using fallback blockhash');
		blockhash = SOLANA_RPC_CONFIG.fallbackBlockhash;
		console.error('Original error:', error);
	}

	const transaction = new Transaction();
	transaction.recentBlockhash = blockhash;
	transaction.feePayer = publicKey;

	transaction.add(
		SystemProgram.transfer({
			fromPubkey: publicKey,
			toPubkey: publicKey,
			lamports: 1000,
		}),
	);

	const serializedTransaction = transaction.serialize({
		verifySignatures: false,
	});

	const base64Transaction = Buffer.from(serializedTransaction).toString('base64');

	return base64Transaction;
};

const stringToBase64 = (str: string): string => {
	// React Native doesn't have TextEncoder, so we'll use Buffer
	const buffer = Buffer.from(str, 'utf8');
	return buffer.toString('base64');
};

export const generateSolanaMethodExamples = async (method: string, address: string) => {
	switch (method) {
		case 'signMessage':
			return {
				params: {
					account: { address },
					message: stringToBase64('Hello, world!'),
				},
			};
		case 'signTransaction':
			return {
				params: {
					account: { address },
					transaction: await generateBase64Transaction(address),
					scope: FEATURED_NETWORKS['Solana Mainnet'],
				},
			};
		case 'signAllTransactions':
			return {
				params: {
					account: { address },
					transactions: [await generateBase64Transaction(address), await generateBase64Transaction(address)],
					scope: FEATURED_NETWORKS['Solana Mainnet'],
				},
			};
		case 'signAndSendTransaction':
			return {
				params: {
					account: { address },
					transaction: await generateBase64Transaction(address),
					scope: FEATURED_NETWORKS['Solana Mainnet'],
				},
			};
		case 'signIn':
			return {
				params: {
					address,
					domain: 'metamask.io',
					statement: 'Please sign in.',
				},
			};
		case 'getGenesisHash':
			return {
				params: {},
			};
		default:
			return {};
	}
};

