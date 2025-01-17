// packages/multichainapi/src/types.ts

import { CaipAccountId, Json } from "@metamask/utils";


/**
 * Interfaces for CAIP-based Scopes and Sessions
 */
export interface ScopeObject {
  references?: string[];
  methods?: string[];
  notifications?: string[];
  accounts?: CaipAccountId[];
}

export interface ScopedProperties {
  [scopeString: string]: Json;
}

export interface SessionProperties {
  [key: string]: Json;
}


/**
 * Represents a tracked session in local store.
 */
export interface SessionData {
  sessionId: string;
  sessionScopes: Record<string, ScopeObject>;
  scopedProperties?: ScopedProperties;
  sessionProperties?: SessionProperties;
  expiry?: string;
}

export interface MethodParams {
  chainId?: string;
  method: string;
  params?: unknown[] | Record<string, unknown>;
}

export interface SessionEventData {
  type: 'created' | 'updated' | 'revoked';
  session: SessionData;
}

export interface MultichainEvents {
  sessionChanged: (event: SessionEventData) => void;
  notification: (notification: unknown) => void;
}
