import { type CaipAccountId, type CaipChainId, parseCaipAccountId, parseCaipChainId } from '@metamask/utils';
import packageJson from '../../../package.json';
import { type DappSettings, getInfuraRpcUrls, getPlatformType, type MultichainOptions, PlatformType, type Scope, type SessionData, type StoreClient } from '../../domain';

export type OptionalScopes = Record<Scope, SessionData['sessionScopes'][Scope]>;

export function getDappId(dapp?: DappSettings) {
	if (typeof window === 'undefined' || typeof window.location === 'undefined') {
		return dapp?.name ?? dapp?.url ?? 'N/A';
	}

	return window.location.hostname;
}

export function getVersion() {
	return packageJson.version;
}

export function getOptionalScopes(scopes: Scope[]) {
	return scopes.reduce<OptionalScopes>(
		(prev, scope) => ({
			...prev,
			[scope]: {
				methods: [],
				notifications: [],
				accounts: [],
			},
		}),
		{},
	);
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

export function getValidAccounts(caipAccountIds: CaipAccountId[]) {
	return caipAccountIds.reduce<ReturnType<typeof parseCaipAccountId>[]>((caipAccounts, caipAccountId) => {
		try {
			return [...caipAccounts, parseCaipAccountId(caipAccountId)];
		} catch (err) {
			const stringifiedAccountId = JSON.stringify(caipAccountId);
			console.error(`Invalid CAIP account ID: ${stringifiedAccountId}`, err);
			return caipAccounts;
		}
	}, []);
}

/**
 * Adds valid accounts to their corresponding scopes based on chain namespace and reference.
 * Returns a new OptionalScopes object without modifying the input.
 *
 * @param optionalScopes - The scopes to add accounts to
 * @param validAccounts - Array of parsed valid accounts
 * @returns A new OptionalScopes object with accounts added to matching scopes
 */
export function addValidAccounts(optionalScopes: OptionalScopes, validAccounts: ReturnType<typeof getValidAccounts>): OptionalScopes {
	if (!optionalScopes || !validAccounts?.length) {
		return optionalScopes;
	}

	const result: OptionalScopes = Object.fromEntries(
		Object.entries(optionalScopes).map(([scope, scopeData]) => [
			scope,
			{
				methods: [...(scopeData?.methods ?? [])],
				notifications: [...(scopeData?.notifications ?? [])],
				accounts: [...(scopeData?.accounts ?? [])],
			},
		]),
	);

	// Group accounts by their chain identifier for efficient lookup
	const accountsByChain = new Map<string, CaipAccountId[]>();
	for (const account of validAccounts) {
		const chainKey = `${account.chain.namespace}:${account.chain.reference}`;
		const accountId = `${account.chainId}:${account.address}` as CaipAccountId;

		if (!accountsByChain.has(chainKey)) {
			accountsByChain.set(chainKey, []);
		}
		accountsByChain.get(chainKey)!.push(accountId);
	}

	// Add accounts to matching scopes
	for (const [scopeKey, scopeData] of Object.entries(result)) {
		if (!scopeData?.accounts) {
			continue;
		}

		try {
			const scope = scopeKey as CaipChainId;
			const scopeDetails = parseCaipChainId(scope as any);
			const chainKey = `${scopeDetails.namespace}:${scopeDetails.reference}`;

			const matchingAccounts = accountsByChain.get(chainKey);
			if (matchingAccounts) {
				const existingAccounts = new Set(scopeData.accounts);
				const newAccounts = matchingAccounts.filter((account) => !existingAccounts.has(account));
				scopeData.accounts.push(...(newAccounts as any));
			}
		} catch (error) {
			console.error(`Invalid scope format: ${scopeKey}`, error);
		}
	}

	return result;
}
