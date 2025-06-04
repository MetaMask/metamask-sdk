import type {
  MultichainApiClient,
  SessionData,
} from '@metamask/multichain-api-client';
import type { CaipChainId, CaipAccountId } from '@metamask/utils';

import type EIP155 from './eip155';

export type RPCAPI = {
  eip155: EIP155;
};

export type NotificationCallback = (notification: any) => void;

export abstract class MultichainSDKBase {
  protected abstract provider: MultichainApiClient<RPCAPI>;

  abstract getSession(): Promise<SessionData | undefined>;

  abstract createSession(
    scopes: CaipChainId[],
    caipAccountIds: CaipAccountId[],
  ): Promise<SessionData>;

  abstract revokeSession(): Promise<void>;

  abstract onNotification(listener: NotificationCallback): () => void;

  abstract invokeMethod(method: string, params: any[]): Promise<any>;
}
