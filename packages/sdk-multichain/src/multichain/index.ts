import { type CreateSessionParams, getDefaultTransport, getMultichainClient, type MultichainApiClient, type SessionData, type Transport } from '@metamask/multichain-api-client';
import { analytics } from '@metamask/sdk-analytics';
import type { CaipAccountId, Json } from '@metamask/utils';
import packageJson from '../../package.json';
import { type InvokeMethodOptions, type ModalFactoryConnectOptions, type MultichainOptions, type RPCAPI, type Scope, TransportType } from '../domain';
import { createLogger, enableDebug, isEnabled as isLoggerEnabled } from '../domain/logger';
import { MultichainCore, type SDKState } from '../domain/multichain';
import { getPlatformType, PlatformType } from '../domain/platform';
import { MWPTransport } from './mwp';
import { RPCClient } from './rpc/client';
import { addValidAccounts, getDappId, getOptionalScopes, getValidAccounts, getVersion, setupDappMetadata, setupInfuraProvider } from './utils';
import { type SessionRequest, SessionStore, WebSocketTransport } from '@metamask/mobile-wallet-protocol-core';
import { MWP_RELAY_URL } from 'src/config';
import { DappClient } from '@metamask/mobile-wallet-protocol-dapp-client';
import { keymanager } from './mwp/KeyManager';

//ENFORCE NAMESPACE THAT CAN BE DISABLED
const logger = createLogger('metamask-sdk:core');

let __provider: MultichainApiClient<RPCAPI> | undefined;
let __transport: Transport | undefined;
let __dappClient: DappClient | undefined;

export class MultichainSDK extends MultichainCore {
	public state: SDKState;
	private listener: (() => void | Promise<void>) | undefined;

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

	get dappClient() {
		if (!__dappClient) {
			throw new Error('DappClient not initialized, establish connection first');
		}
		return __dappClient;
	}

	async getCurrentSession(): Promise<SessionData | undefined> {
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
	}

	private async onTransportNotification(data: unknown) {
		if (typeof data !== 'object') return;
		if (!data) return;

		if (!('method' in data)) {
			return;
		}

		if (!('params' in data)) {
			return;
		}

		// biome-ignore lint/suspicious/noExplicitAny: Ok
		if (!('session' in (data as any).params)) {
			return;
		}

		if (data && data.method === 'session_changed') {
			// biome-ignore lint/suspicious/noExplicitAny: Ok
			const session = (data.params as any)?.session;
			//TODO: We also should report this as an issue, sessions with no sessionScopes should be undefined, is there any reason
			//why the object comes empty?
			this.emit('session_changed', Object.keys(session?.sessionScopes ?? {}).length > 0 ? session : undefined);
		}
	}

	private async getStoredTransport() {
		const transportType = await this.storage.getTransport();
		if (transportType) {
			if (transportType === TransportType.Browser) {
				return getDefaultTransport(this.options.transport);
			} else if (transportType === TransportType.MPW) {
				const { adapter: kvstore } = this.options.storage;
				const sessionstore = new SessionStore(kvstore);
				const websocket = typeof window !== 'undefined' ? WebSocket : (await import('ws')).WebSocket;
				const transport = await WebSocketTransport.create({ url: MWP_RELAY_URL, kvstore, websocket });
				const dappClient = new DappClient({ transport, sessionstore, keymanager });
				__dappClient = dappClient;
				return new MWPTransport(__dappClient, kvstore);
			} else {
				await this.storage.removeTransport();
			}
		}
		return undefined;
	}

	private async setupTransport() {
		const storedTransport = await this.getStoredTransport();
		if (storedTransport) {
			//Assign the transport to the global state
			__transport = storedTransport;
			await __transport.connect();
		}
		//If we have a transport, we can setup the provider and the listeners
		if (__transport) {
			//provider will auto connect to the transport
			__provider = getMultichainClient({ transport: __transport });

			//Add event listeners to the transport
			this.listener = __transport.onNotification(this.onTransportNotification.bind(this));

			//If we have a session, we can emit the session_changed event
			const session = await this.getCurrentSession();
			if (Object.keys(session?.sessionScopes ?? {}).length > 0) {
				this.emit('session_changed', session);
			}
		}
	}

	private async init() {
		try {
			if (typeof window !== 'undefined' && window.mmsdk?.isInitialized) {
				logger('MetaMaskSDK: init already initialized');
			} else {
				await this.setupAnalytics();
				await this.setupTransport();
				this.state = 'loaded';
				analytics.track('sdk_initialized', {});
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

	private async onConnectionSuccess(params: ModalFactoryConnectOptions) {
		try {
			const session = await this.getCurrentSession();
			const currentScopes = Object.keys(session?.sessionScopes ?? {}) as Scope[];
			const proposedScopes = params.scopes;

			const isSameScopes = currentScopes.every((scope) => proposedScopes.includes(scope)) && proposedScopes.every((scope) => currentScopes.includes(scope));
			if (isSameScopes) {
				this.emit('session_changed', session);
				return;
			}

			if (session) {
				await this.provider.revokeSession();
			}

			const { scopes, caipAccountIds } = params;
			const optionalScopes = addValidAccounts(getOptionalScopes(scopes), getValidAccounts(caipAccountIds));
			const sessionRequest: CreateSessionParams<RPCAPI> = { optionalScopes };
			const newSession = await this.provider.createSession(sessionRequest);
			this.emit('session_changed', newSession);
		} catch (error) {
			logger('MetaMaskSDK error during onConnectionSuccess', error);
		}
	}

	private async showInstallModal(desktopPreferred: boolean, scopes: Scope[], caipAccountIds: CaipAccountId[]) {
		await this.setupMWP();

		return new Promise<void>((resolve, reject) => {
			const render = new Promise((_, rejectUIFactory) => {
				return this.options.ui.factory.renderInstallModal(
					desktopPreferred,
					() => {
						return new Promise<SessionRequest>((resolveSession) => {
							this.dappClient.on('connected', () => {
								this.options.ui.factory.unload(true);
							});
							this.dappClient.once('session_request', resolveSession);
							this.transport.connect().catch(rejectUIFactory);
						});
					},
					(success: boolean, error?: Error) => {
						if (success) {
							this.onConnectionSuccess({ scopes, caipAccountIds }).then(resolve).catch(reject);
						} else {
							reject(error);
						}
					},
				);
			});

			render.then(() => resolve()).catch(reject);
		});
	}

	private async setupMWP() {
		const { adapter: kvstore } = this.options.storage;
		const sessionstore = new SessionStore(kvstore);
		const websocket = typeof window !== 'undefined' ? WebSocket : (await import('ws')).WebSocket;
		const transport = await WebSocketTransport.create({ url: MWP_RELAY_URL, kvstore, websocket });
		const dappClient = new DappClient({ transport, sessionstore, keymanager });

		const apiTransport = new MWPTransport(dappClient, kvstore);
		this.listener = apiTransport.onNotification(this.onTransportNotification.bind(this));
		const apiClient = getMultichainClient({ transport: apiTransport });

		__transport = apiTransport;
		__provider = apiClient;
		__dappClient = dappClient;

		await this.options.storage.setTransport(TransportType.MPW);
	}

	async connect(scopes: Scope[], caipAccountIds: CaipAccountId[]): Promise<void> {
		const { ui } = this.options;
		const platformType = getPlatformType();
		const isWeb = platformType === PlatformType.MetaMaskMobileWebview || platformType === PlatformType.DesktopWeb || platformType === PlatformType.MobileWeb;
		const { preferExtension = true, preferDesktop = false, headless: _headless = false } = ui;

		if (__transport?.isConnected()) {
			const existingSession = await this.getCurrentSession();
			if (existingSession) {
				return this.onConnectionSuccess({ scopes, caipAccountIds });
			}
		}

		//2. If is web, has extension and preferExtension is true, directly connect with the extension
		if (isWeb && this.hasExtension && preferExtension) {
			await this.storage.setTransport(TransportType.Browser);
			const transport = await getDefaultTransport(this.options.transport);
			this.listener = transport.onNotification(this.onTransportNotification.bind(this));
			__transport = transport;
			await __transport.connect();
			__provider = getMultichainClient({ transport: __transport });
			return this.onConnectionSuccess({ scopes, caipAccountIds });
		}

		// Determine preferred option for install modal
		let preferredOption: boolean;
		if (isWeb) {
			preferredOption = this.hasExtension ? preferDesktop : !preferExtension || preferDesktop;
		} else {
			preferredOption = preferDesktop;
		}

		return this.showInstallModal(preferredOption, scopes, caipAccountIds);
	}

	async disconnect(): Promise<void> {
		await __transport?.disconnect();
		await __provider?.revokeSession();
		await __dappClient?.disconnect();

		this.listener?.();

		__transport = undefined;
		__provider = undefined;

		this.emit('session_changed', undefined);
		this.listener = undefined;

		await this.storage.removeTransport();
	}

	async invokeMethod(options: InvokeMethodOptions): Promise<Json> {
		return this.client.invokeMethod(options);
	}
}
