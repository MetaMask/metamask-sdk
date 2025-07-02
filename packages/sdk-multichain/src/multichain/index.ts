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
import { METHODS_TO_REDIRECT,  MultichainSDKBase, type RPC_URLS_MAP } from "../domain/multichain";
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
import { getAnonId, getDappId, getInfuraRpcUrls, getVersion, setupDappMetadata, setupInfuraProvider, isMetaMaskInstalled, createConnectionLink } from "../utis";
import { RPCClient } from "src/utis/rpc/client";
import packageJson from '../../package.json';
import { StoreClient } from "src/domain/store/client";
import { createUIManager, type UIManager, type UIModalController } from "../domain";
import { EventEmitter } from "../domain/events";
import type { SDKEvents } from "../domain/events/types/sdk";

//ENFORCE NAMESPACE THAT CAN BE DISABLED
const logger = createLogger("metamask-sdk:core");

export class MultichainSDK extends EventEmitter<SDKEvents> implements MultichainSDKBase {
	private transport!: Transport;
	private provider!: MultichainApiClient<RPCAPI>;
	private isInitialized : boolean = false;
  private readonly options: MultichainSDKConstructor;
  public readonly storage: StoreClient;
  private uiManager?: UIManager;
  private activeModal?: UIModalController;

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

	private async init() {
		if (typeof window !== "undefined" && window.mmsdk?.isInitialized) {
			logger("MetaMaskSDK: init already initialized");
		}
    await this.setupAnalytics();
    await this.setupUI();
    this.isInitialized = true;
	}

  private async setupUI() {
    if (this.options.ui.headless) {
      logger("UI disabled (headless mode)");
      return;
    }

    try {
      this.uiManager = await createUIManager({
        headless: this.options.ui.headless,
        debug: false, // You could add debug option to MultichainSDKConstructor
      });
      logger("UI manager initialized");
    } catch (error) {
      logger("Failed to initialize UI manager:", error);
    }
  }

	async connect(options?: { extensionId?: string }): Promise<boolean> {
    // Check if extension is available and preferred
    if (this.uiManager?.isExtensionAvailable() && !options?.extensionId) {
      try {
        await this.uiManager.connectWithExtension?.();
        return true;
      } catch (error) {
        logger("Extension connection failed, falling back to mobile connection:", error);
      }
    }

    // Handle mobile connection with UI
    if (!this.transport.isConnected) {
      await this.startMobileConnection();
      await this.transport.connect();
    }
    return this.transport.isConnected()
	}

  private async startMobileConnection(): Promise<void> {
    // Generate connection link
    const anonId = await getAnonId(this.storage);
    const connectionLink = createConnectionLink({
      channelId: 'temp-channel-id', // This should come from transport
      pubKey: 'temp-pub-key', // This should come from transport
      dapp: this.options.dapp,
      anonId,
      source: 'multichain-sdk',
    });

    // Emit display_uri event for custom handling
    this.emit('display_uri', connectionLink);

    // Show modal if UI is available
    if (this.uiManager && !this.options.ui.headless) {
      try {
        this.activeModal = await this.uiManager.showConnectionModal({
          link: connectionLink,
          dapp: this.options.dapp,
          sdkVersion: getVersion(),
          onClose: (shouldTerminate) => {
            if (shouldTerminate) {
              this.emit('provider_update', 'terminate');
            }
          },
          onConnect: () => {
            this.emit('provider_update', 'initialized');
          }
        });
      } catch (error) {
        logger("Failed to show connection modal:", error);
      }
    }
  }

	async disconnect(): Promise<void> {
    // Close any active modal
    if (this.activeModal) {
      this.activeModal.close();
      this.activeModal = undefined;
    }
		this.transport.disconnect();
	}

  /**
   * Check if MetaMask extension is available
   */
  isExtensionAvailable(): boolean {
    return this.uiManager?.isExtensionAvailable() ?? false;
  }

  /**
   * Get the current connection QR code link (if available)
   */
  getConnectionLink(): string | undefined {
    // This would need to be stored when connection is initiated
    // For now, return undefined - could be enhanced to store the last generated link
    return undefined;
  }

  /**
   * Close any active connection modal
   */
  closeModal(): void {
    if (this.activeModal) {
      this.activeModal.close(false);
      this.activeModal = undefined;
    }
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
