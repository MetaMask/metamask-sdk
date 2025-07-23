import * as uuid from 'uuid';
import packageJson from '../../package.json';
import { type DappSettings, getInfuraRpcUrls, type MultichainOptions } from '../domain/multichain';
import { getPlatformType, PlatformType } from '../domain/platform';
import type { StoreClient } from '../domain/store/client';

export function getVersion() {
	return packageJson.version;
}

export function getDappId(dapp?: DappSettings) {
	if (typeof window === 'undefined' || typeof window.location === 'undefined') {
		return dapp?.name ?? dapp?.url ?? 'N/A';
	}

	return window.location.hostname;
}

export async function getAnonId(storage: StoreClient) {
	const anonId = await storage.getAnonId();
	if (anonId) {
		return anonId;
	}
	const newAnonId = uuid.v4();
	await storage.setAnonId(newAnonId);
	return newAnonId;
}

export const extractFavicon = () => {
	if (typeof document === 'undefined') {
		return undefined;
	}

	let favicon: string | undefined;
	const nodeList = document.getElementsByTagName('link');
	// eslint-disable-next-line @typescript-eslint/prefer-for-of
	for (let i = 0; i < nodeList.length; i++) {
		if (nodeList[i].getAttribute('rel') === 'icon' || nodeList[i].getAttribute('rel') === 'shortcut icon') {
			favicon = nodeList[i].getAttribute('href') ?? undefined;
		}
	}
	return favicon;
};

export function setupInfuraProvider(options: MultichainOptions): MultichainOptions {
	const infuraAPIKey = options.api?.infuraAPIKey;
	if (!infuraAPIKey) {
		return options;
	}
	const urlsWithToken = getInfuraRpcUrls(infuraAPIKey);
	if (options.api?.readonlyRPCMap) {
		options.api.readonlyRPCMap = {
			...options.api.readonlyRPCMap,
			...urlsWithToken,
		};
	} else if (options.api) {
		options.api.readonlyRPCMap = urlsWithToken;
	}
	return options;
}

export function setupDappMetadata(options: MultichainOptions): MultichainOptions {
	const platform = getPlatformType();
	const isBrowser = platform === PlatformType.DesktopWeb || platform === PlatformType.MobileWeb || platform === PlatformType.MetaMaskMobileWebview;

	if (!options.dapp?.url) {
		// Automatically set dappMetadata on web env if not defined
		if (isBrowser) {
			options.dapp = {
				...options.dapp,
				url: `${window.location.protocol}//${window.location.host}`,
			};
		} else {
			throw new Error('You must provide dapp url');
		}
	}
	const BASE_64_ICON_MAX_LENGTH = 163400;
	// Check if iconUrl and url are valid
	const urlPattern = /^(http|https):\/\/[^\s]*$/; // Regular expression for URLs starting with http:// or https://
	if (options.dapp) {
		if ('iconUrl' in options.dapp) {
			if (options.dapp.iconUrl && !urlPattern.test(options.dapp.iconUrl)) {
				console.warn('Invalid dappMetadata.iconUrl: URL must start with http:// or https://');
				options.dapp.iconUrl = undefined;
			}
		}
		// This check ensures that the base64Icon string in the dappMetadata does not exceed 163,400 characters.
		// The character limit is important because a longer base64-encoded string causes the connection to the mobile app to fail.
		// Keeping the base64Icon string length below this threshold ensures reliable communication and functionality.
		if ('base64Icon' in options.dapp) {
			if (options.dapp.base64Icon && options.dapp.base64Icon.length > BASE_64_ICON_MAX_LENGTH) {
				console.warn('Invalid dappMetadata.base64Icon: Base64-encoded icon string length must be less than 163400 characters');

				options.dapp.base64Icon = undefined;
			}
		}
		if (options.dapp.url && !urlPattern.test(options.dapp.url)) {
			console.warn('Invalid dappMetadata.url: URL must start with http:// or https://');
		}
		const favicon = extractFavicon();
		if (favicon && !('iconUrl' in options.dapp) && !('base64Icon' in options.dapp)) {
			const faviconUrl = `${window.location.protocol}//${window.location.host}${favicon}`;
			// @ts-ignore
			options.dapp.iconUrl = faviconUrl;
		}
	}
	return options;
}

/**
 * Check if MetaMask extension is installed
 */
export function isMetaMaskInstalled(): boolean {
	if (typeof window === 'undefined') {
		return false;
	}
	return Boolean(window.ethereum?.isMetaMask);
}
