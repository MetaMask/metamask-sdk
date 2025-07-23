import { infuraRpcUrls } from './constants';
import type { RPC_URLS_MAP } from './types';

export function getInfuraRpcUrls(infuraAPIKey: string) {
	return Object.keys(infuraRpcUrls).reduce((acc, key) => {
		const typedKey = key as keyof typeof infuraRpcUrls;
		acc[typedKey] = `${infuraRpcUrls[typedKey]}${infuraAPIKey}`;
		return acc;
	}, {} as RPC_URLS_MAP);
}
