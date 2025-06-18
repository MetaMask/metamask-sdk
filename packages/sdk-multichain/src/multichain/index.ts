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
} from "src/domain/logger";

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

	private async init() {
		if (typeof window !== "undefined" && window.mmsdk?.isInitialized) {
			logger("MetaMaskSDK: init already initialized");
		}
		//initialize with try catch and return promise that resolves SDK
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
