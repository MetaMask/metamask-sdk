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

export interface LoggerLike {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  log: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}

export interface StoredSession {
  sessionId: string;
  extensionId: string;
  expiry?: string;
}


/**
 * Represents a tracked session in local store.
 */
export interface SessionData {
  sessionId?: string; // Not used in metamask.
  sessionScopes: Record<string, ScopeObject>;
  scopedProperties?: ScopedProperties; // Not implemented in metamask yet?
  sessionProperties?: SessionProperties; // Not implemented in metamask yet?
  expiry?: string; // Not implemented in metamask yet?
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
