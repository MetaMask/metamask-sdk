import {
	getDefaultTransport,
	getMultichainClient,
	type InvokeMethodParams,
	type MultichainApiClient,
	type SessionData,
	type Transport,
} from "@metamask/multichain-api-client";
import {
	parseCaipAccountId,
	parseCaipChainId,
	type CaipAccountId,
} from "@metamask/utils";
import type { MetaMaskInpageProvider } from "@metamask/providers";
import { analytics } from '@metamask/sdk-analytics';

import type { MultichainSDKBase } from "../domain/multichain";
import type {
	MultichainSDKConstructor,
	MultichainSDKOptions,
	NotificationCallback,
	Scope,
	RPCAPI,
	InvokeMethodOptions,
} from "../domain";
import {
	createLogger,
	enableDebug,
	isEnabled as isLoggerEnabled,
} from "../domain/logger";
import { getPlatformType, isBrowser, isReactNative } from "../domain/platform";
import { getAnonId, getDappId, getVersion } from "../utis";

//ENFORCE NAMESPACE THAT CAN BE DISABLED
const logger = createLogger("metamask-sdk:core");




export class MultichainSDK implements MultichainSDKBase {
	private _transport!: Transport;
	public _initialized = false;
	private _provider!: MultichainApiClient<RPCAPI>;

	private constructor(protected readonly options: MultichainSDKConstructor) {
		if (!options.dapp?.url) {
			// Automatically set dappMetadata on web env if not defined
			if (typeof window !== "undefined" && typeof document !== "undefined") {
				options.dapp = {
					...options.dapp,
					url: `${window.location.protocol}//${window.location.host}`,
				};
			} else {
				throw new Error("You must provide dapp url");
			}
		}
	}

	static async create({ ...options }: MultichainSDKOptions) {
		const instance = new MultichainSDK(options);
		const isEnabled = await isLoggerEnabled(
			"metamask-sdk:core",
			instance.storage,
		);
		if (isEnabled) {
			enableDebug("metamask-sdk:core");
		}
		logger("MultichainSDK initialize");
		try {
			await await instance.init();
			logger("MultichainSDK initialized");
			if (typeof window !== "undefined") {
				window.mmsdk = instance;
			}
		} catch (err) {
			logger("MetaMaskSDK error during initialization", err);
		}
		return instance;
	}

	get provider() {
		if (!this._provider) {
			const transport = getDefaultTransport(this.options.transport);
			this._transport = transport;
			this._provider = getMultichainClient({ transport });
		}
		return this._provider;
	}

	get transport() {
    //TODO: we probably want to extend those with new addings
		if (!this._transport) {
			const transport = getDefaultTransport(this.options.transport);
			this._transport = transport;
		}
		return this._transport;
	}

	get storage() {
		return this.options.storage;
	}

	get isInitialized() {
		return this._initialized;
	}

  private async setupAnalytics() {
    if (!this.options.analytics.enabled) {
      return
    }
    if (!isBrowser() && !isReactNative()) {
      return;
    }

    const version = getVersion();
    const dappId = getDappId(this.options.dapp);
    const anonId = await getAnonId(this.storage);
    const platform = getPlatformType();
    const integrationType = this.options.analytics.integrationType;

    analytics.setGlobalProperty('sdk_version', version);
    analytics.setGlobalProperty('dapp_id', dappId);
    analytics.setGlobalProperty('anon_id', anonId);
    analytics.setGlobalProperty('platform', platform);
    analytics.setGlobalProperty('integration_type', integrationType);

    analytics.enable();
    analytics.track('sdk_initialized', {});
  }

  private async setupDappMetadata() {
    throw new Error("Not implemented");
  }

  private async setupInfuraProvider() {
    throw new Error("Not implemented");
  }

  private async setupReadOnlyRPCProviders() {
    throw new Error("Not implemented");
  }

  private async setupExtensionPreferences():Promise<{
    preferExtension: boolean;
    shouldReturn: boolean;
    metamaskBrowserExtension: MetaMaskInpageProvider | undefined;
}> {
    //Preloads the extension related data
    throw new Error("Not implemented");
  }

	private async init() {
		if (typeof window !== "undefined" && window.mmsdk?.isInitialized) {
			logger("MetaMaskSDK: init already initialized");
		}
		//initialize with try catch and return promise that resolves SDK

    //Setup Analytics
    await this.setupAnalytics();

    // //Setup Dapp Metadata
    // await this.setupDappMetadata();

    // //Setup Infura Provider
    // await this.setupInfuraProvider();

    // //Setup Readonly RPC Providers
    // await this.setupReadOnlyRPCProviders();

	}

	async connect(options: { extensionId?: string }): Promise<boolean> {
		const transport = getDefaultTransport(options);
		this._provider = getMultichainClient({ transport });
		this._transport = transport;
		return await transport.connect();
	}

	async disconnect(): Promise<void> {
		this.transport.disconnect();
	}

	onNotification(listener: NotificationCallback): () => void {
		return this.provider.onNotification(listener);
	}

	async getSession() {
		return this.provider.getSession();
	}

	async revokeSession() {
		return this.provider.revokeSession();
	}

	async createSession(
		scopes: Scope[],
		caipAccountIds: CaipAccountId[],
	): Promise<SessionData> {
		const optionalScopes: Record<
			Scope,
			{ methods: string[]; notifications: string[]; accounts: CaipAccountId[] }
		> = {};

		// biome-ignore lint/complexity/noForEach: <explanation>
		scopes.forEach((scope) => {
			optionalScopes[scope] = {
				methods: [],
				notifications: [],
				accounts: [],
			};
		});

		// biome-ignore lint/complexity/noForEach: <explanation>
		caipAccountIds.forEach((accountId: CaipAccountId) => {
			try {
				const {
					chain: { namespace: accountNamespace },
				} = parseCaipAccountId(accountId);

				// biome-ignore lint/complexity/noForEach: <explanation>
				Object.keys(optionalScopes).forEach((scopeKey) => {
					const scope = scopeKey as Scope;
					const scopeDetails = parseCaipChainId(scope);

					if (scopeDetails.namespace === accountNamespace) {
						const scopeData = optionalScopes[scope];
						if (scopeData) {
							scopeData.accounts.push(accountId);
						}
					}
				});
			} catch (error) {
				const stringifiedAccountId = JSON.stringify(accountId);
				console.error(
					`Invalid CAIP account ID: ${stringifiedAccountId}`,
					error,
				);
			}
		});
		return this.provider.createSession({ optionalScopes });
	}

	async invokeMethod(options: InvokeMethodOptions) {
		// TODO: Expose types on multichain api package
		return this.provider.invokeMethod(
			options as InvokeMethodParams<RPCAPI, Scope, never>,
		);
	}
}
