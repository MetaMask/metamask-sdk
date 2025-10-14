/** biome-ignore-all lint/suspicious/noAsyncPromiseExecutor: <explanation> */

import { ErrorCode, ProtocolError, type SessionRequest, SessionStore, WebSocketTransport } from '@metamask/mobile-wallet-protocol-core';
import { DappClient } from '@metamask/mobile-wallet-protocol-dapp-client';
import { getMultichainClient, type MultichainApiClient, type SessionData } from '@metamask/multichain-api-client';
import { analytics } from '@metamask/sdk-analytics';
import type { CaipAccountId, Json } from '@metamask/utils';
import { METAMASK_CONNECT_BASE_URL, METAMASK_DEEPLINK_BASE, MWP_RELAY_URL } from 'src/config';
import packageJson from '../../package.json';
import { type InvokeMethodOptions, type MultichainOptions, type RPCAPI, type Scope, TransportType } from '../domain';
import { createLogger, enableDebug, isEnabled as isLoggerEnabled } from '../domain/logger';
import { type ConnectionRequest, type ExtendedTransport, MultichainCore, type SDKState } from '../domain/multichain';
import { getPlatformType, hasExtension, isSecure, PlatformType } from '../domain/platform';
import { RPCClient } from './rpc/client';
import { DefaultTransport } from './transports/default';

import { MWPTransport } from './transports/mwp';
import { keymanager } from './transports/mwp/KeyManager';
import { getDappId, getVersion, openDeeplink, setupDappMetadata, setupInfuraProvider } from './utils';

//ENFORCE NAMESPACE THAT CAN BE DISABLED
const logger = createLogger('metamask-sdk:core');

export class MultichainSDK extends MultichainCore {
	private __provider: MultichainApiClient<RPCAPI> | undefined = undefined;
	private __transport: ExtendedTransport | undefined = undefined;
	private __dappClient: DappClient | undefined = undefined;
	private __beforeUnloadListener: (() => void) | undefined;
	public __state: SDKState = 'pending';
	private listener: (() => void | Promise<void>) | undefined;

	get state() {
		return this.__state;
	}
	set state(value: SDKState) {
		this.__state = value;
		this.options.transport?.onNotification?.({
			method: 'stateChanged',
			params: value,
		});
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

	get storage() {
		return this.options.storage;
	}

	private get sdkInfo() {
		return `Sdk/Javascript SdkVersion/${packageJson.version} Platform/${getPlatformType()} dApp/${this.options.dapp.url ?? this.options.dapp.name} dAppTitle/${this.options.dapp.name}`;
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

	private async onTransportNotification(payload: any) {
		if (typeof payload === 'object' && payload !== null && 'method' in payload) {
			this.emit(payload.method as string, payload.params || payload.result);
		}
	}

	private async getStoredTransport() {
		const { ui } = this.options;
		const { preferExtension = true, headless: _headless = false } = ui;
		const transportType = await this.storage.getTransport();
		if (transportType) {
			if (transportType === TransportType.Browser) {
				//Check if the user still have the extension or not return the transport
				if (hasExtension() && preferExtension) {
					const apiTransport = new DefaultTransport();
					this.__transport = apiTransport;
					this.listener = apiTransport.onNotification(this.onTransportNotification.bind(this));
					return apiTransport;
				}
			} else if (transportType === TransportType.MPW) {
				const { adapter: kvstore } = this.options.storage;
				const dappClient = await this.createDappClient();
				const apiTransport = new MWPTransport(dappClient, kvstore);
				this.__dappClient = dappClient;
				this.__transport = apiTransport;
				this.listener = apiTransport.onNotification(this.onTransportNotification.bind(this));
				return apiTransport;
			}

			await this.storage.removeTransport();
		}

		return undefined;
	}

	private async setupTransport() {
		const transport = await this.getStoredTransport();
		if (transport) {
			if (!this.transport.isConnected()) {
				this.state = 'connecting';
				await this.transport.connect();
			}
			this.state = 'connected';
			if (this.transport instanceof MWPTransport) {
				await this.storage.setTransport(TransportType.MPW);
			} else {
				await this.storage.setTransport(TransportType.Browser);
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
			await this.storage.removeTransport();
			this.state = 'pending';
			logger('MetaMaskSDK error during initialization', error);
		}
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
		if (this.__transport instanceof MWPTransport) {
			return;
		}
		//Only setup MWP if it is not already mwp
		const { adapter: kvstore } = this.options.storage;
		const dappClient = await this.createDappClient();
		this.__dappClient = dappClient;
		const apiTransport = new MWPTransport(dappClient, kvstore);
		this.__transport = apiTransport;
		this.listener = this.transport.onNotification(this.onTransportNotification.bind(this));
		await this.storage.setTransport(TransportType.MPW);
	}

	private async onBeforeUnload() {
		//Fixes glitch with "connecting" state when modal is still visible and we close screen or refresh
		if (this.options.ui.factory.modal?.isMounted) {
			await this.storage.removeTransport();
		}
	}

	private createBeforeUnloadListener() {
		if (typeof window !== 'undefined' && typeof window.addEventListener !== 'undefined') {
			window.addEventListener('beforeunload', this.onBeforeUnload.bind(this));
		}
		return () => {
			if (typeof window !== 'undefined' && typeof window.removeEventListener !== 'undefined') {
				window.removeEventListener('beforeunload', this.onBeforeUnload.bind(this));
			}
		};
	}

	private async showInstallModal(desktopPreferred: boolean, scopes: Scope[], caipAccountIds: CaipAccountId[]) {
		// create the listener only once to avoid memory leaks
		this.__beforeUnloadListener ??= this.createBeforeUnloadListener();
		return new Promise<void>((resolve, reject) => {
			// Use Connection Modal
			this.options.ui.factory.renderInstallModal(
				desktopPreferred,
				async () => {
					if (this.dappClient.state === 'CONNECTED' || this.dappClient.state === 'CONNECTING') {
						await this.dappClient.disconnect();
					}
					return new Promise<ConnectionRequest>((resolveConnectionRequest) => {
						this.dappClient.on('session_request', (sessionRequest: SessionRequest) => {
							resolveConnectionRequest({
								sessionRequest,
								metadata: {
									dapp: this.options.dapp,
									sdk: {
										version: getVersion(),
										platform: getPlatformType(),
									},
								},
							});
						});

						this.transport
							.connect({ scopes, caipAccountIds })
							.then(() => {
								this.options.ui.factory.unload();
								this.options.ui.factory.modal?.unmount();
								this.state = 'connected';
								return this.storage.setTransport(TransportType.MPW);
							})
							.catch((err) => {
								if (err instanceof ProtocolError) {
									//Ignore Request expired errors to allow modal to regenerate expired qr codes
									if (err.code !== ErrorCode.REQUEST_EXPIRED) {
										this.state = 'disconnected';
										reject(err);
									}
									// If request is expires, the QRCode will automatically be regenerated we can ignore this case
								} else {
									this.state = 'disconnected';
									reject(err);
								}
							});
					});
				},
				async (error?: Error) => {
					if (!error) {
						await this.storage.setTransport(TransportType.MPW);
						resolve();
					} else {
						await this.storage.removeTransport();
						reject(error);
					}
				},
			);
		});
	}

	private async setupDefaultTransport() {
		this.state = 'connecting';
		await this.storage.setTransport(TransportType.Browser);
		const transport = new DefaultTransport();
		this.listener = transport.onNotification(this.onTransportNotification.bind(this));
		this.__transport = transport;
		return transport;
	}

	private async deeplinkConnect(scopes: Scope[], caipAccountIds: CaipAccountId[]) {
		return new Promise<void>(async (resolve, reject) => {
			this.dappClient.on('message', (payload: any) => {
				const data = payload.data as Record<string, unknown>;
				if (typeof data === 'object' && data !== null) {
					if ('method' in data && data.method === 'wallet_createSession') {
						if (data.error) {
							this.state = 'loaded';
							return reject(data.error);
						}
						//TODO: is it .params or .result?
						// biome-ignore lint/suspicious/noExplicitAny: Expected here
						const session = ((data as any).params || (data as any).result) as SessionData;
						if (session) {
							// Initial request will be what resolves the connection when options is specified
							this.options.transport?.onNotification?.(payload.data);
							this.emit('wallet_sessionChanged', session);
						}
					}
				}
			});

			let timeout: NodeJS.Timeout | undefined;

			if (!this.transport.isConnected()) {
				this.dappClient.once('session_request', (sessionRequest: SessionRequest) => {
					const connectionRequest = {
						sessionRequest,
						metadata: {
							dapp: this.options.dapp,
							sdk: { version: getVersion(), platform: getPlatformType() },
						},
					};
					const deeplink = this.options.ui.factory.createDeeplink(connectionRequest);
					const universalLink = this.options.ui.factory.createUniversalLink(connectionRequest);
					if (this.options.mobile?.preferredOpenLink) {
						this.options.mobile.preferredOpenLink(deeplink, '_self');
					} else {
						openDeeplink(this.options, deeplink, universalLink);
					}
				});
			} else {
				timeout = setTimeout(() => {
					const deeplink = this.options.ui.factory.createDeeplink();
					const universalLink = this.options.ui.factory.createUniversalLink();
					if (this.options.mobile?.preferredOpenLink) {
						this.options.mobile.preferredOpenLink(deeplink, '_self');
					} else {
						openDeeplink(this.options, deeplink, universalLink);
					}
				}, 250);
			}

			this.transport
				.connect({ scopes, caipAccountIds })
				.then(resolve)
				.catch((err) => {
					this.storage.removeTransport();
					reject(err);
				})
				.finally(() => {
					if (timeout) {
						clearTimeout(timeout);
					}
				});
		});
	}

	private async handleConnection(promise: Promise<void>) {
		this.state = 'connecting';
		return promise
			.then(() => {
				this.state = 'connected';
			})
			.catch((err) => {
				this.state = 'disconnected';
				return Promise.reject(err);
			});
	}

	async connect(scopes: Scope[], caipAccountIds: CaipAccountId[]): Promise<void> {
		const { ui } = this.options;
		const platformType = getPlatformType();
		const isWeb = platformType === PlatformType.MetaMaskMobileWebview || platformType === PlatformType.DesktopWeb;
		const { preferExtension = true, preferDesktop = false, headless: _headless = false } = ui;
		const secure = isSecure();

		if (this.__transport?.isConnected() && !secure) {
			return this.handleConnection(
				this.__transport.connect({ scopes, caipAccountIds }).then(() => {
					if (this.__transport instanceof MWPTransport) {
						return this.storage.setTransport(TransportType.MPW);
					} else {
						return this.storage.setTransport(TransportType.Browser);
					}
				}),
			);
		}

		if (isWeb && hasExtension() && preferExtension) {
			//If metamask extension is available, connect to it
			const defaultTransport = await this.setupDefaultTransport();
			// Web transport has no initial payload
			return this.handleConnection(defaultTransport.connect({ scopes, caipAccountIds }));
		}

		// Connection will now be InstallModal + QRCodes or Deeplinks, both require mwp
		await this.setupMWP();

		// Determine preferred option for install modal
		const isDesktopPreferred = hasExtension() ? preferDesktop : !preferExtension || preferDesktop;

		if (secure && !isDesktopPreferred) {
			// Desktop is not preferred option, so we use deeplinks (mobile web)
			return this.handleConnection(this.deeplinkConnect(scopes, caipAccountIds));
		}

		// Show install modal for RN, Web + Node
		return this.handleConnection(this.showInstallModal(isDesktopPreferred, scopes, caipAccountIds));
	}

	public override emit(event: string, args: any): void {
		this.options.transport?.onNotification?.({ method: event, params: args });
		super.emit(event, args);
	}

	async disconnect(): Promise<void> {
		this.listener?.();
		this.__beforeUnloadListener?.();

		await this.__transport?.disconnect();
		await this.storage.removeTransport();

		this.emit('wallet_sessionChanged', undefined);
		this.emit('stateChanged', 'disconnected');

		this.listener = undefined;
		this.__beforeUnloadListener = undefined;
		this.__transport = undefined;
		this.__provider = undefined;
		this.__dappClient = undefined;
	}

	async invokeMethod(request: InvokeMethodOptions): Promise<Json> {
		const { sdkInfo, transport } = this;

		this.__provider ??= getMultichainClient({ transport });

		const client = new RPCClient(this.transport, this.options, sdkInfo);
		return client.invokeMethod(request) as Promise<Json>;
	}
}
