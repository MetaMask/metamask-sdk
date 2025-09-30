import type { StoreClient } from '../store';
import type { MultichainCore } from '.';
import type { RPC_URLS_MAP, Scope } from './api/types';
import type { ModalFactory } from '../../ui';
import type { SessionRequest } from '@metamask/mobile-wallet-protocol-core';
import type { PlatformType } from '../platform';
import type { Transport } from '@metamask/multichain-api-client';
import type { CaipAccountId } from '@metamask/utils';

export type { SessionData } from '@metamask/multichain-api-client';

/**
 * Configuration settings for the dapp using the SDK.
 *
 * This type allows for two variants of dapp configuration:
 * - Using a regular icon URL
 * - Using a base64-encoded icon
 */
export type DappSettings = {
	name?: string;
	url?: string;
} & ({ iconUrl?: string } | { base64Icon?: string });

export type ConnectionRequest = {
	sessionRequest: SessionRequest;
	metadata: {
		dapp: DappSettings;
		sdk: { version: string; platform: PlatformType };
	};
};

/**
 * Constructor options for creating a Multichain SDK instance.
 *
 * This type defines all the configuration options available when
 * initializing the SDK, including dapp settings, API configuration,
 * analytics, storage, UI preferences, and transport options.
 */
export type MultichainOptions = {
	/** Dapp identification and branding settings */
	dapp: DappSettings;
	/** Optional API configuration for external services */
	api?: {
		/** The Infura API key to use for RPC requests */
		infuraAPIKey?: string;
		/** A map of RPC URLs to use for read-only requests */
		readonlyRPCMap?: RPC_URLS_MAP;
	};
	/** Analytics configuration */
	analytics?: { enabled: false } | { enabled: true; integrationType: string };
	/** Storage client for persisting SDK data */
	storage: StoreClient;
	/** UI configuration options */
	ui: {
		factory: ModalFactory;
		headless?: boolean;
		preferExtension?: boolean;
		preferDesktop?: boolean;
	};
	mobile?: {
		preferredOpenLink?: (deeplink: string, target?: string) => void;
		/**
		 * The `MetaMaskSDK` constructor option `useDeeplink: boolean` controls which type of link is used:
		 * -   If `true`, the SDK will attempt to use the `metamask://` deeplink.
		 * -   If `false` (the default for web), the SDK will use the `https://metamask.app.link` universal link.
		 */
		useDeeplink?: boolean;
	};
	/** Optional transport configuration */
	transport?: {
		/** Extension ID for browser extension transport */
		extensionId?: string;
		onNotification?: (notification: unknown) => void;
	};
};

type MultiChainFNOptions = Omit<MultichainOptions, 'storage' | 'ui'> & {
	ui?: Omit<MultichainOptions['ui'], 'factory'>;
} & {
	storage?: StoreClient;
};

/**
 * Complete options for Multichain SDK configuration.
 *
 * This type extends the base options with storage configuration,
 * providing all necessary options for SDK initialization.
 */
export type CreateMultichainFN = (options: MultiChainFNOptions) => Promise<MultichainCore>;

export type ExtendedTransport = Omit<Transport, 'connect'> & {
	connect: (props?: { scopes: Scope[]; caipAccountIds: CaipAccountId[] }) => Promise<void>;
};
