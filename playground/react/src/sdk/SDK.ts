import type { CaipAccountId, CaipChainId, Json } from '@metamask/utils';
import { parseCaipChainId, parseCaipAccountId } from '@metamask/utils';

import type MetaMaskMultichainBaseProvider from './providers/MetaMaskMultichainBaseProvider';
import MetaMaskMultichainExternallyConnectableProvider from './providers/MetaMaskMultichainExternallyConnectableProvider';
import MetaMaskMultichainWindowPostMessageProvider from './providers/MetaMaskMultichainWindowPostMessageProvider';

export const WINDOW_POST_MESSAGE_ID = 'window.postMessage';
export const METAMASK_PROD_CHROME_ID = 'nkbihfbeogaeaoehlefnkodbefgpgknn';

export class SDK {
  #provider: MetaMaskMultichainBaseProvider | null;

  constructor() {
    this.#provider = null;
  }

  public async createSession(
    scopes: CaipChainId[],
    caipAccountIds: CaipAccountId[],
  ): Promise<Json> {
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

    return this.#provider?.request({
      method: 'wallet_createSession',
      params: { optionalScopes },
    });
  }

  public async invokeMethod(options: {
    scope: CaipChainId;
    request: {
      method: string;
      params: Json[];
    };
  }): Promise<Json> {
    const { scope, request } = options;
    return this.#provider?.request({
      method: 'wallet_invokeMethod',
      params: {
        scope,
        request,
      },
    });
  }

  public async revokeSession(): Promise<Json> {
    return this.#provider?.request({
      method: 'wallet_revokeSession',
      params: [],
    });
  }

  public async getSession(): Promise<{
    sessionScopes: Record<
      CaipChainId,
      { methods: string[]; notifications: string[] }
    >;
  } | null> {
    return this.#provider?.request({
      method: 'wallet_getSession',
      params: [],
    });
  }

  public onNotification(listener: (notification: Json) => void): void {
    this.#provider?.onNotification(listener);
  }

  public disconnect(): void {
    this.#provider?.disconnect();
  }

  public async setExtensionIdAndConnect(extensionId: string): Promise<boolean> {
    // TODO add logic once we have CAIP-294 wallet discovery + or hardcode the stable extensionId
    let connected;
    if (extensionId === WINDOW_POST_MESSAGE_ID) {
      this.#provider = new MetaMaskMultichainWindowPostMessageProvider();
      connected = await this.#provider.connect();
    } else {
      this.#provider = new MetaMaskMultichainExternallyConnectableProvider();
      connected = await this.#provider.connect(extensionId);
    }

    return connected;
  }
}
