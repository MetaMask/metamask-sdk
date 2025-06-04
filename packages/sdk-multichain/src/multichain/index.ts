import type {
  MultichainApiClient,
  Transport,
} from '@metamask/multichain-api-client';
import {
  getDefaultTransport,
  getMultichainClient,
} from '@metamask/multichain-api-client';
import type { CaipAccountId, CaipChainId } from '@metamask/utils';
import { parseCaipChainId, parseCaipAccountId } from '@metamask/utils';

import { Store } from '../store';
import type { MultichainSDKConstructor, MultichainSDKOptions } from './types';
import type { NotificationCallback, RPCAPI } from '../domain/multichain/api';
import { MultichainSDKBase } from '../domain/multichain/api';

export type * from './types';

export class MultichainSDK extends MultichainSDKBase {
  protected transport: Transport;

  protected get provider(): MultichainApiClient<RPCAPI> {
    return getMultichainClient({ transport: this.transport });
  }

  private constructor(private readonly options: MultichainSDKConstructor) {
    super();
    // TODO: To extend with more transport
    // Transport options just requires extensionId for extenrallyConnectableTransport
    this.transport = getDefaultTransport(options.transport);
  }

  static async create({ storage, ...options }: MultichainSDKOptions) {
    const instance = new MultichainSDK({
      ...options,
      storage: new Store(storage),
    });
    return instance;
  }

  public onNotification(listener: NotificationCallback): () => void {
    return this.provider.onNotification(listener);
  }

  public async connect() {
    return this.transport.connect();
  }

  public async getSession() {
    return this.provider.getSession();
  }

  public async revokeSession() {
    return this.provider.revokeSession();
  }

  public async createSession(
    scopes: CaipChainId[],
    caipAccountIds: CaipAccountId[],
  ) {
    const optionalScopes: Record<
      CaipChainId,
      { methods: string[]; notifications: string[]; accounts: CaipAccountId[] }
    > = {};

    scopes.forEach((scope) => {
      optionalScopes[scope] = {
        methods: [],
        notifications: [],
        accounts: [],
      };
    });

    caipAccountIds.forEach((accountId: CaipAccountId) => {
      try {
        const {
          chain: { namespace: accountNamespace },
        } = parseCaipAccountId(accountId);

        Object.keys(optionalScopes).forEach((scopeKey) => {
          const scope = scopeKey as CaipChainId;
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

  public async disconnect(): Promise<void> {
    // This is not exposed, we should expose it from provider
    // This helps cleaning all listeners, etc
    throw new Error('Not implemented');
  }

  public async invokeMethod(method: string, params: any[]): Promise<any> {
    throw new Error('Not implemented');
  }
}
