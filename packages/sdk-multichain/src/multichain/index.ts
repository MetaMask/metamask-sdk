import {
  getDefaultTransport,
  getMultichainClient,
  type MultichainApiClient,
  type SessionData,
} from "@metamask/multichain-api-client";
import {
  parseCaipAccountId,
  parseCaipChainId,
  type CaipAccountId,
} from "@metamask/utils";
import { analytics } from '@metamask/sdk-analytics';
import { MultichainSDKBase } from "../domain/multichain";
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
import { getAnonId, getDappId, getVersion, setupDappMetadata, setupInfuraProvider } from "../utis";
import { RPCClient } from "src/utis/rpc/client";
import packageJson from '../../package.json';
import { StoreClient } from "src/domain/store/client";
import { EventEmitter } from "../domain/events";
import type { SDKEvents } from "../domain/events/types/sdk";

//ENFORCE NAMESPACE THAT CAN BE DISABLED
const logger = createLogger("metamask-sdk:core");


type OptionalScopes = Record<
  Scope,
  { methods: string[]; notifications: string[]; accounts: CaipAccountId[] }
>;

export class MultichainSDK extends EventEmitter<SDKEvents> implements MultichainSDKBase {
  private provider!: MultichainApiClient<RPCAPI>;
  private readonly options: MultichainSDKConstructor;
  public readonly storage: StoreClient;
  private readonly rpcClient: RPCClient;
  public isInitialized: boolean = false;
  public session: SessionData | undefined;

  private constructor(options: MultichainSDKConstructor) {
    super();

    const withInfuraRPCMethods = setupInfuraProvider(options);
    const withDappMetadata = setupDappMetadata(withInfuraRPCMethods);
    this.options = withDappMetadata;
    this.storage = options.storage;
    const platformType = getPlatformType();
    const sdkInfo = `Sdk/Javascript SdkVersion/${packageJson.version
      } Platform/${platformType} dApp/${this.options.dapp.url ?? this.options.dapp.name} dAppTitle/${this.options.dapp.name
      }`;

    this.rpcClient = new RPCClient(
      this.provider,
      this.options.api,
      sdkInfo
    );

    this.provider = getMultichainClient({ transport: this.transport });
  }

  private get transport() {
    const platformType = getPlatformType();
    if (
      platformType === PlatformType.DesktopWeb ||
      platformType === PlatformType.MetaMaskMobileWebview ||
      platformType === PlatformType.MobileWeb) {
      //Direct support for web and externally connectable
      const transport = getDefaultTransport(this.options.transport);
      return transport;
    }
    //Mobile wallet protocol support
    throw new Error('Not implemented');
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

  async init() {
    if (typeof window !== "undefined" && window.mmsdk?.isInitialized) {
      logger("MetaMaskSDK: init already initialized");
    }
    await this.setupAnalytics();
    this.session = await this.provider.getSession();
    this.isInitialized = true;
  }

  async connect(
    scopes: Scope[],
    caipAccountIds: CaipAccountId[],
  ): Promise<SessionData> {
    if (!this.transport.isConnected) {
      await this.transport.connect();
    }

    const optionalScopes = scopes.reduce<OptionalScopes>((prev, scope) => ({
      ...prev,
      [scope]: {
        methods: [],
        notifications: [],
        accounts: [],
      },
    }), {});

    const validAccounts = caipAccountIds.reduce<ReturnType<typeof parseCaipAccountId>[]>((caipAccounts, caipAccountId) => {
      try {
        return [
          ...caipAccounts,
          parseCaipAccountId(caipAccountId)
        ]
      } catch (err) {
        const stringifiedAccountId = JSON.stringify(caipAccountId);
        console.error(
          `Invalid CAIP account ID: ${stringifiedAccountId}`,
          err,
        );
        return caipAccounts;
      }
    }, []);

    for (const account of validAccounts) {
      for (const scopeKey of Object.keys(optionalScopes)) {
        const scope = scopeKey as Scope;
        const scopeDetails = parseCaipChainId(scope);
        if (scopeDetails.namespace === account.chain.namespace && scopeDetails.reference === account.chain.reference) {
          const scopeData = optionalScopes[scope];
          if (scopeData) {
            scopeData.accounts.push(account.address as CaipAccountId);
          }
        }
      }
    }

    const session = await this.provider.getSession()
    if (session) {
      const noOverlap = Object.keys(session.sessionScopes).every(scope => scopes.includes(scope as Scope));
      if (noOverlap) {
        // No overlap between existing and new scopes, return the existing session
        return session;
      }
      // Scopes have overlap, revoke the session and create new one
      await this.provider.revokeSession();
    }
    this.session = await this.provider.createSession({ optionalScopes });
    return this.session;

  }

  async disconnect(): Promise<void> {
    return this.transport.disconnect();
  }

  onNotification(listener: NotificationCallback) {
    return this.provider.onNotification(listener);
  }

  async revokeSession() {
    return this.provider.revokeSession();
  }

  async invokeMethod(options: InvokeMethodOptions) {
    return this.rpcClient.invokeMethod(options);
  }
}
