import {
  getDefaultTransport,
  getMultichainClient,
  type InvokeMethodParams,
  type MultichainApiClient,
  type SessionData,
  type Transport,
} from '@metamask/multichain-api-client';
import {
  parseCaipAccountId,
  parseCaipChainId,
  type CaipAccountId,
} from '@metamask/utils';

import type {
  MultichainSDKBase,
  MultichainSDKConstructor,
  MultichainSDKOptions,
  NotificationCallback,
  Scope,
  RPCAPI,
  InvokeMethodOptions,
} from '../domain';
import { Store } from '../domain';

export class MultichainSDK implements MultichainSDKBase {
  private _transport!: Transport;

  private _provider!: MultichainApiClient<RPCAPI>;

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

  private constructor(protected readonly options: MultichainSDKConstructor) {}

  static async create({ storage, ...options }: MultichainSDKOptions) {
    const instance = new MultichainSDK({
      ...options,
      storage: new Store(storage),
    });
    return instance;
  }

  public async connect(options: { extensionId?: string }): Promise<boolean> {
    const transport = getDefaultTransport(options);
    this._provider = getMultichainClient({ transport });
    this._transport = transport;
    return await transport.connect();
  }

  public async disconnect(): Promise<void> {
    this.transport.disconnect();
  }

  public onNotification(listener: NotificationCallback): () => void {
    return this.provider.onNotification(listener);
  }

  public async getSession() {
    return this.provider.getSession();
  }

  public async revokeSession() {
    return this.provider.revokeSession();
  }

  public async createSession(
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

  public async invokeMethod(options: InvokeMethodOptions) {
    // TODO: Expose types on multichain api package
    return this.provider.invokeMethod(
      options as InvokeMethodParams<RPCAPI, Scope, never>,
    );
  }
}
