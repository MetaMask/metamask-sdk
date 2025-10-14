import { infuraRpcUrls } from './constants';
import type { RpcUrlsMap } from './types';

export function getInfuraRpcUrls(infuraAPIKey: string) {
	return Object.keys(infuraRpcUrls).reduce((acc, key) => {
		const typedKey = key as keyof typeof infuraRpcUrls;
		acc[typedKey] = `${infuraRpcUrls[typedKey]}${infuraAPIKey}`;
		return acc;
	}, {} as RpcUrlsMap);
}
