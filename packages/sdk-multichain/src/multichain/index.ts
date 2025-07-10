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
import { analytics } from '@metamask/sdk-analytics';
import {   MultichainSDKBase, type RPC_URLS_MAP } from "../domain/multichain";
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
import { getPlatformType, PlatformType } from "../domain/platform";
import { getAnonId, getDappId, getInfuraRpcUrls, getVersion, setupDappMetadata, setupInfuraProvider } from "../utis";
import { RPCClient } from "src/utis/rpc/client";
import packageJson from '../../package.json';
import { StoreClient } from "src/domain/store/client";
import { EventEmitter } from "../domain/events";
import type { SDKEvents } from "../domain/events/types/sdk";
import { METHODS_TO_REDIRECT } from "src/domain/multichain/api/constants";

//ENFORCE NAMESPACE THAT CAN BE DISABLED
const logger = createLogger("metamask-sdk:core");

export class MultichainSDK extends EventEmitter<SDKEvents> implements MultichainSDKBase {
	private transport!: Transport;
	private provider!: MultichainApiClient<RPCAPI>;
	private isInitialized : boolean = false;
  private readonly options: MultichainSDKConstructor;
  public readonly storage: StoreClient;

	private constructor(options: MultichainSDKConstructor) {
    super();
    const transport = getDefaultTransport(options.transport);
    const withInfuraRPCMethods = setupInfuraProvider(options);
    const withDappMetadata = setupDappMetadata(withInfuraRPCMethods);
    this.options = withDappMetadata;
    this.storage = options.storage;
		this.provider = getMultichainClient({ transport });
		this.transport = transport;
	}

	static async create(options: MultichainSDKOptions) {
		const instance = new MultichainSDK(options);
		const isEnabled = await isLoggerEnabled(
			"metamask-sdk:core",
			instance.storage,
		);
		if (isEnabled) {
			enableDebug("metamask-sdk:core");
		}
		try {
			await instance.init();
			if (typeof window !== "undefined") {
				window.mmsdk = instance;
			}
		} catch (err) {
			logger("MetaMaskSDK error during initialization", err);
		}
		return instance;
	}

  private async setupAnalytics() {
    if (!this.options.analytics.enabled) {
      return
    }

    const platform = getPlatformType();
    const isBrowser =
      platform === PlatformType.MetaMaskMobileWebview ||
      platform === PlatformType.DesktopWeb ||
      platform === PlatformType.MobileWeb;

    const isReactNative = platform === PlatformType.ReactNative;

    //Replaces old !isBrowser() && !isReactNative()
    if (!isBrowser && !isReactNative) {
        return
    }

    const version = getVersion();
    const dappId = getDappId(this.options.dapp);
    const anonId = await getAnonId(this.storage);

    const integrationType = this.options.analytics.integrationType;

    analytics.setGlobalProperty('sdk_version', version);
    analytics.setGlobalProperty('dapp_id', dappId);
    analytics.setGlobalProperty('anon_id', anonId);
    analytics.setGlobalProperty('platform', platform);
    analytics.setGlobalProperty('integration_type', integrationType);

    analytics.enable();
    analytics.track('sdk_initialized', {});
  }

	private async init() {
		if (typeof window !== "undefined" && window.mmsdk?.isInitialized) {
			logger("MetaMaskSDK: init already initialized");
		}
    await this.setupAnalytics();
    this.isInitialized = true;
	}

	async connect(): Promise<boolean> {
    // Handle mobile connection with UI
    if (!this.transport.isConnected) {
      await this.transport.connect();
    }
    return this.transport.isConnected()
	}

	async disconnect(): Promise<void> {
		this.transport.disconnect();
	}
  /**
   * Get the current connection QR code link (if available)
   */
  getConnectionLink(): string | undefined {
    // This would need to be stored when connection is initiated
    // For now, return undefined - could be enhanced to store the last generated link
    return undefined;
  }

	onNotification(listener: NotificationCallback): () => void {
		return this.provider.onNotification(listener as any);
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
    const {request} = options;
    let readonlyRPCMap: RPC_URLS_MAP = {};
    const infuraAPIKey = this.options.api?.infuraAPIKey;
    if (infuraAPIKey) {
      const urlsWithToken = getInfuraRpcUrls(infuraAPIKey);
      if (this.options.api?.readonlyRPCMap) {
        readonlyRPCMap = {
          ...this.options.api.readonlyRPCMap,
          ...urlsWithToken,
        };
      } else {
        readonlyRPCMap = urlsWithToken;
      }
    }
    const platformType = getPlatformType();
    const rpcEndpoint = readonlyRPCMap[options.scope];
    const isReadOnlyMethod = !METHODS_TO_REDIRECT[request.method];
    const sdkInfo = `Sdk/Javascript SdkVersion/${
      packageJson.version
    } Platform/${platformType} dApp/${this.options.dapp.url ?? this.options.dapp.name} dAppTitle/${
      this.options.dapp.name
    }`;

    if (rpcEndpoint && isReadOnlyMethod) {
      const client = new RPCClient(rpcEndpoint, sdkInfo);
      const response = await client.request(request.method, request.params);
      return response;
    }
		// TODO: Expose types on multichain api package
		return this.provider.invokeMethod(
			options as InvokeMethodParams<RPCAPI, Scope, never>,
		);
	}
}
