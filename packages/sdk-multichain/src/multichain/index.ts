import { type CreateSessionParams, getMultichainClient, type MultichainApiClient, type SessionData } from '@metamask/multichain-api-client';
import { analytics } from '@metamask/sdk-analytics';
import type { CaipAccountId, Json } from '@metamask/utils';
import packageJson from '../../package.json';
import { type InvokeMethodOptions, type ModalFactoryConnectOptions, type MultichainOptions, type RPCAPI, type Scope, TransportType } from '../domain';
import { createLogger, enableDebug, isEnabled as isLoggerEnabled } from '../domain/logger';
import { type ConnectionRequest, type ExtendedTransport, MultichainCore, type SDKState } from '../domain/multichain';
import { getPlatformType, hasExtension, isSecure, PlatformType } from '../domain/platform';
import { RPCClient } from './rpc/client';
import { addValidAccounts, getDappId, getOptionalScopes, getValidAccounts, getVersion, setupDappMetadata, setupInfuraProvider } from './utils';
import { ErrorCode, ProtocolError, type SessionRequest, SessionStore, WebSocketTransport } from '@metamask/mobile-wallet-protocol-core';
import { METAMASK_CONNECT_BASE_URL, METAMASK_DEEPLINK_BASE, MWP_RELAY_URL } from 'src/config';
import { DappClient } from '@metamask/mobile-wallet-protocol-dapp-client';

import { MWPTransport } from './transports/mwp';
import { keymanager } from './transports/mwp/KeyManager';
import { DefaultTransport } from './transports/default';

//ENFORCE NAMESPACE THAT CAN BE DISABLED
const logger = createLogger('metamask-sdk:core');

export class MultichainSDK extends MultichainCore {
	private __provider: MultichainApiClient<RPCAPI> | undefined = undefined;
	private __transport: ExtendedTransport | undefined = undefined;
	private __dappClient: DappClient | undefined = undefined;

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
				this.state = 'connected';
			} else {
				this.state = 'connected';
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

	private openDeeplink(deeplink: string, universalLink: string) {
		const { mobile } = this.options;
		const useDeeplink = mobile && mobile.useDeeplink !== undefined ? mobile.useDeeplink : true;
		if (useDeeplink) {
			if (typeof window !== 'undefined') {
				// We don't need to open a deeplink in a new tab
				// It avoid the browser to display a blank page
				window.location.href = deeplink;
			}
		} else if (typeof document !== 'undefined') {
			// Workaround for https://github.com/rainbow-me/rainbowkit/issues/524.
			// Using 'window.open' causes issues on iOS in non-Safari browsers and
			// WebViews where a blank tab is left behind after connecting.
			// This is especially bad in some WebView scenarios (e.g. following a
			// link from Twitter) where the user doesn't have any mechanism for
			// closing the blank tab.
			// For whatever reason, links with a target of "_blank" don't suffer
			// from this problem, and programmatically clicking a detached link
			// element with the same attributes also avoids the issue.
			const link = document.createElement('a');
			link.href = universalLink;
			link.target = '_self';
			link.rel = 'noreferrer noopener';
			link.click();
		}
	}

	private async showInstallModal(desktopPreferred: boolean, scopes: Scope[], caipAccountIds: CaipAccountId[]) {
		return new Promise<void>((resolve, reject) => {
			// Use Connection Modal
			this.options.ui.factory.renderInstallModal(
				desktopPreferred,
				async () => {
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
							})
							.catch((err) => {
								if (err instanceof ProtocolError) {
									//Ignore Request expired errors to allow modal to regenerate expired qr codes
									if (err.code !== ErrorCode.REQUEST_EXPIRED) {
										reject(err);
									}
									// If request is expires, the QRCode will automatically be regenerated we can ignore this case
								} else {
									reject(err);
								}
							});
					});
				},
				async (error?: Error) => {
					this.options.ui.factory.modal?.unmount();
					if (!error) {
						await this.storage.setTransport(TransportType.MPW);
						//this.__provider = getMultichainClient({ transport: this.transport });
						this.state = 'connected';
						resolve();
					} else {
						this.state = 'disconnected';
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
		return new Promise<void>((resolve, reject) => {
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
							this.state = 'connected';
							return resolve();
						}
					}
				}
			});
			this.dappClient.once('session_request', (sessionRequest: SessionRequest) => {
				const connectionRequest = {
					sessionRequest,
					metadata: {
						dapp: this.options.dapp,
						sdk: {
							version: getVersion(),
							platform: getPlatformType(),
						},
					},
				};
				const deeplink = this.options.ui.factory.createDeeplink(connectionRequest);
				const universalLink = this.options.ui.factory.createUniversalLink(connectionRequest);
				if (this.options.mobile?.preferredOpenLink) {
					this.options.mobile.preferredOpenLink(deeplink, '_self');
				} else {
					this.openDeeplink(deeplink, universalLink);
				}
			});
			this.state = 'connecting';
			this.transport.connect({ scopes, caipAccountIds }).catch(reject);
		});
	}

	async connect(scopes: Scope[], caipAccountIds: CaipAccountId[]): Promise<void> {
		const { ui } = this.options;
		const platformType = getPlatformType();
		const isWeb = platformType === PlatformType.MetaMaskMobileWebview || platformType === PlatformType.DesktopWeb;
		const { preferExtension = true, preferDesktop = false, headless: _headless = false } = ui;

		if (this.__transport?.isConnected()) {
			return this.__transport.connect({ scopes, caipAccountIds });
		}

		if (isWeb && hasExtension() && preferExtension) {
			//If metamask extension is available, connect to it
			const defaultTransport = await this.setupDefaultTransport();
			// Web transport has no initial payload
			return defaultTransport
				.connect()
				.then(() => {
					this.state = 'connected';
					return Promise.resolve();
				})
				.catch((err) => {
					this.state = 'loaded';
					return Promise.reject(err);
				});
		}

		// Connection will now be InstallModal + QRCodes or Deeplinks, both require mwp
		await this.setupMWP();

		// Determine preferred option for install modal
		let isDesktopPreferred: boolean;
		if (isWeb) {
			isDesktopPreferred = hasExtension() ? preferDesktop : !preferExtension || preferDesktop;
		} else {
			isDesktopPreferred = preferDesktop;
		}

		const secure = isSecure();
		if (secure && !isDesktopPreferred) {
			// Desktop is not preferred option, so we use deeplinks (mobile web)
			return this.deeplinkConnect(scopes, caipAccountIds);
		}

		// Show install modal for RN, Web + Node
		return this.showInstallModal(isDesktopPreferred, scopes, caipAccountIds);
	}

	public override emit(event: string, args: any): void {
		this.options.transport?.onNotification?.({ method: event, params: args });
		super.emit(event, args);
	}

	async disconnect(): Promise<void> {
		this.listener?.();

		await this.__transport?.disconnect();
		await this.storage.removeTransport();

		this.emit('wallet_sessionChanged', undefined);
		this.emit('stateChanged', 'disconnected');

		this.listener = undefined;
		this.__transport = undefined;
		this.__provider = undefined;
		this.__dappClient = undefined;
	}

	async invokeMethod(request: InvokeMethodOptions): Promise<Json> {
		const {
			options: {
				ui: { preferDesktop = false, headless: _headless = false },
			},
			sdkInfo,
			transport,
		} = this;

		this.__provider ??= getMultichainClient({ transport });

		const client = new RPCClient(this.provider, this.options.api, sdkInfo);
		const secure = isSecure();

		if (secure && !preferDesktop) {
			if (this.options.mobile?.preferredOpenLink) {
				this.options.mobile.preferredOpenLink(METAMASK_DEEPLINK_BASE, '_self');
			} else {
				this.openDeeplink(METAMASK_DEEPLINK_BASE, METAMASK_CONNECT_BASE_URL);
			}
		}

		return client.invokeMethod(request);
	}
}
