import { type CreateSessionParams, getDefaultTransport, getMultichainClient, type MultichainApiClient, type SessionData, type Transport } from '@metamask/multichain-api-client';
import { analytics } from '@metamask/sdk-analytics';
import type { CaipAccountId, Json } from '@metamask/utils';
import packageJson from '../../package.json';
import { type InvokeMethodOptions, type ModalFactoryConnectOptions, type MultichainOptions, type RPCAPI, type Scope, TransportType } from '../domain';
import { createLogger, enableDebug, isEnabled as isLoggerEnabled } from '../domain/logger';
import { type ConnectionRequest, MultichainCore, type SDKState } from '../domain/multichain';
import { getPlatformType, PlatformType } from '../domain/platform';
import { MWPTransport } from './mwp';
import { RPCClient } from './rpc/client';
import { addValidAccounts, getDappId, getOptionalScopes, getValidAccounts, getVersion, setupDappMetadata, setupInfuraProvider } from './utils';
import { ErrorCode, ProtocolError, type SessionRequest, SessionStore, WebSocketTransport } from '@metamask/mobile-wallet-protocol-core';
import { MWP_RELAY_URL } from 'src/config';
import { DappClient } from '@metamask/mobile-wallet-protocol-dapp-client';
import { keymanager } from './mwp/KeyManager';

//ENFORCE NAMESPACE THAT CAN BE DISABLED
const logger = createLogger('metamask-sdk:core');
export class MultichainSDK extends MultichainCore {
	private __provider: MultichainApiClient<RPCAPI> | undefined = undefined;
	private __transport: Transport | undefined = undefined;
	private __dappClient: DappClient | undefined = undefined;

	public state: SDKState;
	private listener: (() => void | Promise<void>) | undefined;

	private get client() {
		const platformType = getPlatformType();
		const sdkInfo = `Sdk/Javascript SdkVersion/${packageJson.version} Platform/${platformType} dApp/${this.options.dapp.url ?? this.options.dapp.name} dAppTitle/${this.options.dapp.name}`;
		return new RPCClient(this.provider, this.options.api, sdkInfo);
	}

	get provider() {
		if (!this.__provider) {
			throw new Error('Provider not initialized, establish connection first');
		}
		return this.__provider;
	}

	get transport() {
		if (!this.__transport) {
			throw new Error('Transport not initialized, establish connection first');
		}
		return this.__transport;
	}

	get dappClient() {
		if (!this.__dappClient) {
			throw new Error('DappClient not initialized, establish connection first');
		}
		return this.__dappClient;
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

	private async onTransportNotification(payload: unknown) {
		if (typeof payload === 'object' && payload !== null && 'data' in payload) {
			const data = payload.data as Record<string, unknown>;
			if ('method' in data && data.method === 'wallet_sessionChanged') {
				const session = data.params as SessionData;
				this.emit('wallet_sessionChanged', Object.keys(session?.sessionScopes ?? {}).length > 0 ? session : undefined);
			} else {
				this.emit(data.method as string, data.params);
			}
		}
	}

	private async getStoredTransport() {
		const transportType = await this.storage.getTransport();
		if (transportType) {
			if (transportType === TransportType.Browser) {
				const apiTransport = getDefaultTransport(this.options.transport);
				this.__transport = apiTransport;
				this.listener = apiTransport.onNotification(this.onTransportNotification.bind(this));
				return apiTransport;
			} else if (transportType === TransportType.MPW) {
				const { adapter: kvstore } = this.options.storage;
				const sessionstore = new SessionStore(kvstore);
				const websocket = typeof window !== 'undefined' ? WebSocket : (await import('ws')).WebSocket;
				const transport = await WebSocketTransport.create({ url: MWP_RELAY_URL, kvstore, websocket });
				const dappClient = new DappClient({ transport, sessionstore, keymanager });
				const apiTransport = new MWPTransport(dappClient, kvstore);
				this.__dappClient = dappClient;
				this.__transport = apiTransport;
				this.listener = apiTransport.onNotification(this.onTransportNotification.bind(this));
				return apiTransport;
			} else {
				await this.storage.removeTransport();
			}
		}
		return undefined;
	}

	private async getActiveSession() {
		if (!this.transport.isConnected()) {
			await this.transport.connect();
		}
		const request = await this.transport.request({ method: 'wallet_getSession' });
		const response = request.result as SessionData;
		return response;
	}

	private async setupTransport() {
		const transport = await this.getStoredTransport();
		if (transport) {
			const session = await this.getActiveSession();
			this.__provider = getMultichainClient({ transport });
			//Add event listeners to the transport
			if (session && Object.keys(session.sessionScopes ?? {}).length > 0) {
				// No listeners can exist in here so we need onResumeSession event on constructor
				this.options.transport?.onResumeSession?.(session);
				this.state = 'connected';
			} else {
				this.state = 'loaded';
			}
		} else {
			this.state = 'loaded';
		}
	}

	private async init() {
		try {
			if (typeof window !== 'undefined' && window.mmsdk?.isInitialized) {
				logger('MetaMaskSDK: init already initialized');
			} else {
				await this.setupAnalytics();
				await this.setupTransport();
				analytics.track('sdk_initialized', {});
				if (typeof window !== 'undefined') {
					window.mmsdk = this;
				}
			}
		} catch (error) {
			logger('MetaMaskSDK error during initialization', error);
			this.state = 'loaded';
		}
	}

	private get hasExtension() {
		if (typeof window !== 'undefined') {
			return window.ethereum?.isMetaMask ?? false;
		}
		return false;
	}

	private async onConnectionSuccess(params: ModalFactoryConnectOptions) {
		if (!this.transport.isConnected()) {
			await this.transport.connect();
		}
		try {
			this.state = 'connected';
			const session = await this.getCurrentSession();
			const currentScopes = Object.keys(session?.sessionScopes ?? {}) as Scope[];
			const proposedScopes = params.scopes;
			const isSameScopes = currentScopes.every((scope) => proposedScopes.includes(scope)) && proposedScopes.every((scope) => currentScopes.includes(scope));
			if (isSameScopes) {
				this.emit('wallet_sessionChanged', session);
				return;
			}
			if (session) {
				await this.transport.request({ method: 'wallet_revokeSession', params: session });
			}
			const { scopes, caipAccountIds } = params;
			const optionalScopes = addValidAccounts(getOptionalScopes(scopes), getValidAccounts(caipAccountIds));
			const sessionRequest: CreateSessionParams<RPCAPI> = { optionalScopes };
			const newSessionRequest = await this.transport.request({ method: 'wallet_createSession', params: sessionRequest });
			const newSession = newSessionRequest.result as SessionData;
			this.options.transport?.onResumeSession?.(newSession);
			this.emit('wallet_sessionChanged', newSession);
		} catch (error) {
			logger('MetaMaskSDK error during onConnectionSuccess', error);
		}
	}

	private async showInstallModal(desktopPreferred: boolean, scopes: Scope[], caipAccountIds: CaipAccountId[]) {
		let connectionRequest: ConnectionRequest | undefined;
		return new Promise<void>((resolve, reject) => {
			this.setupMWP()
				.then(() => {
					this.options.ui.factory.renderInstallModal(
						desktopPreferred,
						() => {
							return new Promise<ConnectionRequest>((resolveConnectionRequest) => {
								this.dappClient.on('session_request', (sessionRequest: SessionRequest) => {
									connectionRequest = {
										sessionRequest,
										metadata: {
											dapp: this.options.dapp,
											sdk: {
												version: getVersion(),
												platform: getPlatformType(),
											},
										},
									};
									resolveConnectionRequest(connectionRequest);
								});
								this.transport.connect().catch((err) => {
									if (err instanceof ProtocolError) {
										//Ignore Request expired errors to allow modal to regenerate expired qr codes
										if (err.code !== ErrorCode.REQUEST_EXPIRED) {
											reject(err);
										}
									} else {
										reject(err);
									}
								});
							});
						},
						(error?: Error) => {
							if (!error) {
								this.onConnectionSuccess({ scopes, caipAccountIds }).then(resolve).catch(reject);
							} else {
								this.state = 'disconnected';
								reject(error);
							}
						},
					);
				})
				.catch(reject);
		});
	}

	private async createDappClient() {
		const { adapter: kvstore } = this.options.storage;
		const sessionstore = new SessionStore(kvstore);
		const websocket = typeof window !== 'undefined' ? WebSocket : (await import('ws')).WebSocket;
		const transport = await WebSocketTransport.create({ url: MWP_RELAY_URL, kvstore, websocket });
		const dappClient = new DappClient({ transport, sessionstore, keymanager });
		return dappClient;
	}

	private async setupMWP() {
		const { adapter: kvstore } = this.options.storage;
		const dappClient = await this.createDappClient();
		this.__dappClient = dappClient;

		const apiTransport = new MWPTransport(dappClient, kvstore);
		this.__transport = apiTransport;

		this.dappClient.once('connected', () => {
			const apiClient = getMultichainClient({ transport: this.transport });
			this.__provider = apiClient;
			this.listener = this.transport.onNotification(this.onTransportNotification.bind(this));
			this.options.storage.setTransport(TransportType.MPW);
			this.options.ui.factory.unload();
		});
	}

	async connect(scopes: Scope[], caipAccountIds: CaipAccountId[]): Promise<void> {
		this.state = 'connecting';
		const { ui } = this.options;
		const platformType = getPlatformType();
		const isWeb = platformType === PlatformType.MetaMaskMobileWebview || platformType === PlatformType.DesktopWeb || platformType === PlatformType.MobileWeb;
		const { preferExtension = true, preferDesktop = false, headless: _headless = false } = ui;

		if (this.__transport?.isConnected()) {
			const existingSession = await this.getActiveSession();
			if (existingSession) {
				return this.onConnectionSuccess({ scopes, caipAccountIds });
			}
		}

		//2. If is web, has extension and preferExtension is true, directly connect with the extension
		if (isWeb && this.hasExtension && preferExtension) {
			await this.storage.setTransport(TransportType.Browser);
			const transport = await getDefaultTransport(this.options.transport);
			this.listener = transport.onNotification(this.onTransportNotification.bind(this));
			this.__transport = transport;
			this.__provider = getMultichainClient({ transport: this.__transport });
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
		this.listener?.();

		await this.__transport?.disconnect();
		await this.storage.removeTransport();

		this.emit('wallet_sessionChanged', undefined);

		this.listener = undefined;
		this.__transport = undefined;
		this.__provider = undefined;
		this.__dappClient = undefined;
	}

	async invokeMethod(options: InvokeMethodOptions): Promise<Json> {
		return this.client.invokeMethod(options);
	}
}
