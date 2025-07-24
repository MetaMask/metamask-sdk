import { type CreateSessionParams, getDefaultTransport, getMultichainClient, type MultichainApiClient, type SessionData, type Transport } from '@metamask/multichain-api-client';
import { analytics } from '@metamask/sdk-analytics';
import type { CaipAccountId, Json } from '@metamask/utils';
import packageJson from '../../package.json';
import { type InvokeMethodOptions, type ModalFactoryConnectOptions, type MultichainOptions, type RPCAPI, type Scope, TransportType } from '../domain';
import { createLogger, enableDebug, isEnabled as isLoggerEnabled } from '../domain/logger';
import { MultichainCore, type SDKState } from '../domain/multichain';
import { getPlatformType, PlatformType } from '../domain/platform';
import { MWPClientTransport } from './mwp';
import { RPCClient } from './rpc/client';
import { addValidAccounts, getDappId, getOptionalScopes, getValidAccounts, getVersion, setupDappMetadata, setupInfuraProvider } from './utils';

//ENFORCE NAMESPACE THAT CAN BE DISABLED
const logger = createLogger('metamask-sdk:core');

let __provider: MultichainApiClient<RPCAPI> | undefined;
let __transport: Transport | undefined;

export class MultichainSDK extends MultichainCore {
	public state: SDKState;
	private listeners: (() => void)[] = [];

	/**
	 * Static method to reset global state - useful for testing
	 * @internal
	 */
	static resetGlobals() {
		__provider = undefined;
		__transport = undefined;
	}

	private get client() {
		const platformType = getPlatformType();
		const sdkInfo = `Sdk/Javascript SdkVersion/${packageJson.version} Platform/${platformType} dApp/${this.options.dapp.url ?? this.options.dapp.name} dAppTitle/${this.options.dapp.name}`;
		return new RPCClient(this.provider, this.options.api, sdkInfo);
	}

	get provider() {
		if (!__provider) {
			throw new Error('Provider not initialized, establish connection first');
		}
		return __provider;
	}

	get transport() {
		if (!__transport) {
			throw new Error('Transport not initialized, establish connection first');
		}
		return __transport;
	}

	private async getCurrentSession(): Promise<SessionData | undefined> {
		try {
			//TODO: We should report to the multichain api team that when there's no extension installed
			// getSession timeouts and should be just undefined
			// Thats why we need this function, to compensate that
			let validSession: SessionData | undefined;
			const session = await this.provider.getSession();
			if (Object.keys(session?.sessionScopes ?? {}).length > 0) {
				validSession = session;
			}
			return validSession;
		} catch (err) {
			logger('MetaMaskSDK error during getCurrentSession', err);
			return undefined;
		}
	}

	get storage() {
		return this.options.storage;
	}

	private constructor(options: MultichainOptions) {
		const withInfuraRPCMethods = setupInfuraProvider(options);
		const withDappMetadata = setupDappMetadata(withInfuraRPCMethods);
		const allOptions = {
			...withDappMetadata,
			ui: {
				...withDappMetadata.ui,
				preferExtension: withDappMetadata.ui.preferExtension ?? true,
				preferDesktop: withDappMetadata.ui.preferDesktop ?? false,
				headless: withDappMetadata.ui.headless ?? false,
			},
			analytics: {
				...(options.analytics ?? {}),
				enabled: options.analytics?.enabled !== undefined ? options.analytics.enabled : true,
				integrationType: 'unknown',
			},
		};
		super(allOptions);
		this.state = 'pending';
	}

	static async create(options: MultichainOptions) {
		const instance = new MultichainSDK(options);
		const isEnabled = await isLoggerEnabled('metamask-sdk:core', instance.options.storage);
		if (isEnabled) {
			enableDebug('metamask-sdk:core');
		}
		await instance.init();
		return instance;
	}

	private async setupAnalytics() {
		if (!this.options.analytics?.enabled) {
			return;
		}

		const platform = getPlatformType();
		const isBrowser = platform === PlatformType.MetaMaskMobileWebview || platform === PlatformType.DesktopWeb || platform === PlatformType.MobileWeb;

		const isReactNative = platform === PlatformType.ReactNative;

		if (!isBrowser && !isReactNative) {
			return;
		}

		const version = getVersion();
		const dappId = getDappId(this.options.dapp);
		const anonId = await this.storage.getAnonId();

		const integrationType = this.options.analytics.integrationType;
		analytics.setGlobalProperty('sdk_version', version);
		analytics.setGlobalProperty('dapp_id', dappId);
		analytics.setGlobalProperty('anon_id', anonId);
		analytics.setGlobalProperty('platform', platform);
		analytics.setGlobalProperty('integration_type', integrationType);
		analytics.enable();
		analytics.track('sdk_initialized', {});
	}

	//TODO: Find better ways to type this, if its worth or just use unknown
	// biome-ignore lint/suspicious/noExplicitAny: Figure out later
	private async onTransportNotification(data: any) {
		if (data.method === 'session_changed') {
			const session = data.params.session;
			//TODO: We also should report this as an issue, sessions with no sessionScopes should be undefined, is there any reason
			//why the object comes empty?
			if (Object.keys(session?.sessionScopes ?? {}).length > 0) {
				this.emit('sessionChanged', session);
			} else {
				this.emit('sessionChanged', undefined);
			}
		}
	}

	private async initialTransport() {
		const transportType = await this.storage.getTransport();
		if (transportType) {
			if (transportType === TransportType.Browser) {
				return getDefaultTransport(this.options.transport);
			} else if (transportType === TransportType.MPW) {
				return MWPClientTransport;
			} else {
				await this.storage.removeTransport();
			}
		}
		return undefined;
	}

	private async setupTransport() {
		const initialTransport = await this.initialTransport();
		if (initialTransport) {
			__transport = initialTransport;
		}
		if (__transport) {
			const listener = __transport.onNotification(this.onTransportNotification);
			if (!__transport.isConnected()) {
				await __transport.connect();
			}
			__provider = getMultichainClient({ transport: __transport });
			this.listeners.push(listener);
			const session = await this.getCurrentSession();
			if (Object.keys(session?.sessionScopes ?? {}).length > 0) {
				this.emit('sessionChanged', session);
			}
		}
	}

	async init() {
		try {
			if (typeof window !== 'undefined' && window.mmsdk?.isInitialized) {
				logger('MetaMaskSDK: init already initialized');
			} else {
				await this.setupAnalytics();
				await this.setupTransport();
				this.state = 'loaded';
				if (typeof window !== 'undefined') {
					window.mmsdk = this;
				}
			}
		} catch (error) {
			logger('MetaMaskSDK error during initialization', error);
		}
	}

	private get hasExtension() {
		if (typeof window !== 'undefined') {
			return window.ethereum?.isMetaMask ?? false;
		}
		return false;
	}

	private async onConnectionSuccess(type: TransportType, transport: Transport, params: ModalFactoryConnectOptions) {
		if (!transport.isConnected()) {
			await transport.connect();
		}

		__transport = transport;
		__provider = getMultichainClient({ transport });

		await this.storage.setTransport(type);

		const session = await this.getCurrentSession();
		const currentScopes = Object.keys(session?.sessionScopes ?? {}) as Scope[];
		const proposedScopes = params.scopes;

		const isSameScopes = currentScopes.every((scope) => proposedScopes.includes(scope)) && proposedScopes.every((scope) => currentScopes.includes(scope));

		if (isSameScopes) {
			this.emit('sessionChanged', session);
			return;
		}

		if (session) {
			await this.provider.revokeSession();
		}

		const { scopes, caipAccountIds } = params;
		const optionalScopes = addValidAccounts(getOptionalScopes(scopes), getValidAccounts(caipAccountIds));
		const sessionRequest: CreateSessionParams<RPCAPI> = { optionalScopes };

		const newSession = await this.provider.createSession(sessionRequest);
		this.emit('sessionChanged', newSession);
	}

	private getTransportForPlatformType(platformType: PlatformType) {
		if (__transport) {
			return __transport;
		}
		if (platformType === PlatformType.MetaMaskMobileWebview || platformType === PlatformType.DesktopWeb || platformType === PlatformType.MobileWeb) {
			return getDefaultTransport(this.options.transport);
		}
		return MWPClientTransport;
	}

	async connect(scopes: Scope[], caipAccountIds: CaipAccountId[]): Promise<void> {
		const {
			ui: { factory, ...uiProperties },
		} = this.options;
		const { preferExtension = false, preferDesktop = false, headless: _headless = false } = uiProperties;
		const platformType = getPlatformType();
		const transport = await this.getTransportForPlatformType(platformType);
		const isWeb = platformType === PlatformType.MetaMaskMobileWebview || platformType === PlatformType.DesktopWeb || platformType === PlatformType.MobileWeb;
		const existingSession = await this.getCurrentSession();

		if (isWeb) {
			if (existingSession) {
				return this.onConnectionSuccess(TransportType.Browser, transport, {
					scopes,
					caipAccountIds,
				});
			}

			if (this.hasExtension && preferExtension) {
				return this.onConnectionSuccess(TransportType.Browser, transport, {
					scopes,
					caipAccountIds,
				});
			}

			const link = this.options.dapp.url ?? this.options.dapp.name ?? 'dummy';
			if (!this.hasExtension) {
				if (preferExtension) {
					// render install modal with extension tab selected
					return factory.renderInstallModal(link, false);
				}
				// Doesn't have extension so we show install modal in the preferDesktop value
				return factory.renderInstallModal(link, preferDesktop);
			}

			if (!preferExtension) {
				// Has extension but we don't automatically chooose extension so we should show
				return factory.renderSelectModal(link, true, async () => {
					//This callback is after the user clicked extension in the select tab
					return this.onConnectionSuccess(TransportType.Browser, transport, {
						scopes,
						caipAccountIds,
					});
				});
			}

			//We have extension and extension is the prefferred
			return this.onConnectionSuccess(TransportType.Browser, transport, {
				scopes,
				caipAccountIds,
			});
		} else if (platformType === PlatformType.NonBrowser) {
			return this.onConnectionSuccess(TransportType.MPW, transport, {
				scopes,
				caipAccountIds,
			});
		}

		throw new Error('Not implemented');
	}

	async disconnect(): Promise<void> {
		await __transport?.disconnect();
		await __provider?.revokeSession();

		this.listeners.forEach((listener) => listener());

		__transport = undefined;
		__provider = undefined;

		this.emit('sessionChanged', undefined);
		this.listeners = [];

		await this.storage.removeTransport();
	}

	async invokeMethod(options: InvokeMethodOptions): Promise<Json> {
		return this.client.invokeMethod(options);
	}
}
