// packages/sdk-multichain/src/types.ts

import { CaipAccountId, CaipChainId, Json } from "@metamask/utils";

/**
 * Represents a scope object as defined in CAIP-217.
 * Used to define permissions and capabilities for a specific chain or context.
 */
export interface ScopeObject {
  /** List of external references or resources this scope can access */
  references?: string[];

  /** List of JSON-RPC methods this scope can invoke */
  methods?: string[];

  /** List of notification types this scope can receive */
  notifications?: string[];

  /** List of CAIP-10 account identifiers this scope has access to */
  accounts?: CaipAccountId[];
}

/**
 * Properties that are scoped to specific contexts or chains.
 * Each key is a scope string (e.g., 'eip155:1') with associated JSON data.
 */
export interface ScopedProperties {
  [scopeString: string]: Json;
}

/**
 * Properties that apply to the entire session, not scoped to specific chains.
 */
export interface SessionProperties {
  [key: string]: Json;
}

/**
 * Interface for logging functionality, compatible with console and other logging libraries.
 */
export interface LoggerLike {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  log: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}

/**
 * Represents a stored session with minimal required information.
 */
export interface StoredSession {
  /** CAIP-171 compliant session identifier */
  sessionId: string;

  /** Identifier for the extension or application */
  extensionId: string;

  /** ISO timestamp when the session expires */
  expiry?: string;
}

/**
 * Comprehensive session data including scopes and properties.
 * Represents a tracked session in local store.
 */
export interface SessionData {
  /** CAIP-171 compliant session identifier (not used in MetaMask) */
  sessionId?: string;

  /** Map of chain IDs to their respective scope objects */
  sessionScopes: Record<CaipChainId, ScopeObject>;

  /** Chain-specific properties (not implemented in MetaMask yet) */
  scopedProperties?: ScopedProperties;

  /** Session-wide properties (not implemented in MetaMask yet) */
  sessionProperties?: SessionProperties;

  /** ISO timestamp when the session expires (not implemented in MetaMask yet) */
  expiry?: string;
}

/**
 * Parameters for method invocation requests.
 */
export interface MethodParams {
  /** CAIP-2 chain identifier */
  chainId?: CaipChainId;

  /** JSON-RPC method name */
  method: string;

  /** Method parameters */
  params?: Json;
}

/**
 * Event data for session state changes.
 */
export interface SessionEventData {
  /** Type of session event */
  type: 'created' | 'updated' | 'revoked';

  /** Current session data */
  session: SessionData;
}

/**
 * Events that can be emitted by the multichain provider.
 */
export interface MultichainEvents {
  /** Triggered when session state changes */
  sessionChanged: (event: SessionEventData) => void;

  /** Triggered for chain-specific notifications */
  notification: (notification: unknown) => void;
}

/**
 * Interface for provider implementations.
 * Defines the core functionality required for chain communication.
 */
export interface Provider {
  /** Establish connection with the provider */
  connect(params: unknown): Promise<boolean>;

  /** Terminate the provider connection */
  disconnect(): void;

  /** Send a request to the provider */
  request(params: MethodParams): Promise<unknown>;

  /** Register a notification callback */
  onNotification(callback: (notification: unknown) => void): void;

  /** Remove a specific notification callback */
  removeNotificationListener(callback: (notification: unknown) => void): void;

  /** Remove all notification callbacks */
  removeAllNotificationListeners(): void;
}
