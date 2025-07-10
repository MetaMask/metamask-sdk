import type { SessionData } from '@metamask/multichain-api-client';
import type { CaipAccountId, Json } from '@metamask/utils';

import type { StoreClient } from '../store/client';
import type { InvokeMethodOptions, NotificationCallback, RPC_URLS_MAP, Scope } from './api/types';

/**
 * Configuration settings for the dapp using the SDK.
 *
 * This type allows for two variants of dapp configuration:
 * - Using a regular icon URL
 * - Using a base64-encoded icon
 */
export type DappSettings =
  | { name?: string; url?: string; iconUrl?: string }
  | { name?: string; url?: string; base64Icon?: string };

/**
 * Constructor options for creating a Multichain SDK instance.
 *
 * This type defines all the configuration options available when
 * initializing the SDK, including dapp settings, API configuration,
 * analytics, storage, UI preferences, and transport options.
 */
export type MultichainSDKConstructor = {
  /** Dapp identification and branding settings */
  dapp: DappSettings;
  /** Optional API configuration for external services */
  api?: {
    /** The Infura API key to use for RPC requests */
    infuraAPIKey?: string;
    /** A map of RPC URLs to use for read-only requests */
    readonlyRPCMap?: RPC_URLS_MAP;
  };
  /** Analytics configuration */
  analytics: { enabled: false } | { enabled: true; integrationType: string };
  /** Storage client for persisting SDK data */
  storage: StoreClient;
  /** UI configuration options */
  ui: { headless: boolean };
  /** Optional transport configuration */
  transport?: {
    /** Extension ID for browser extension transport */
    extensionId?: string;
  };
};

/**
 * Abstract base class for the Multichain SDK implementation.
 *
 * This class defines the core interface that all Multichain SDK implementations
 * must provide, including session management, connection handling, and method invocation.
 */
/* c8 ignore start */
export abstract class MultichainSDKBase {
  /**
   * Establishes a connection to the multichain provider.
   *
   * @returns Promise that resolves to true if connection is successful, false otherwise
   */
  abstract connect(): Promise<boolean>;

  /**
   * Disconnects from the multichain provider.
   *
   * @returns Promise that resolves when disconnection is complete
   */
  abstract disconnect(): Promise<void>;

  /**
   * Retrieves the current session data.
   *
   * @returns Promise that resolves to the current session data, or undefined if no session exists
   */
  abstract getSession(): Promise<SessionData | undefined>;

  /**
   * Creates a new session with the specified scopes and account IDs.
   *
   * @param scopes - Array of blockchain scopes to request access to
   * @param caipAccountIds - Array of CAIP account IDs to associate with the session
   * @returns Promise that resolves to the created session data
   */
  abstract createSession(
    scopes: Scope[],
    caipAccountIds: CaipAccountId[],
  ): Promise<SessionData>;

  /**
   * Revokes the current session.
   *
   * @returns Promise that resolves when the session has been revoked
   */
  abstract revokeSession(): Promise<void>;

  /**
   * Registers a listener for incoming notifications.
   *
   * @param listener - Callback function to handle notifications
   * @returns Function to remove the listener
   */
  abstract onNotification(listener: NotificationCallback): () => void;

  /**
   * Invokes an RPC method with the specified options.
   *
   * @param options - The method invocation options including scope and request details
   * @returns Promise that resolves to the method result
   */
  abstract invokeMethod(options: InvokeMethodOptions): Promise<Json>;

  /**
   * Storage client instance for persisting SDK data.
   */
  abstract readonly storage: StoreClient;
}
/* c8 ignore end */

export type { SessionData } from '@metamask/multichain-api-client';

/**
 * Base options for Multichain SDK configuration.
 *
 * This type includes the core configuration options excluding storage,
 * which is handled separately in the full SDK options.
 */
export type MultichainSDKBaseOptions = Pick<
  MultichainSDKConstructor,
  'dapp' | 'analytics' | 'ui' | 'transport'
>;

/**
 * Complete options for Multichain SDK configuration.
 *
 * This type extends the base options with storage configuration,
 * providing all necessary options for SDK initialization.
 */
export type MultichainSDKOptions = MultichainSDKBaseOptions & {
  /** Storage client for persisting SDK data */
  storage: StoreClient;
};

export type CreateMultichainFN = ( options: MultichainSDKBaseOptions ) => Promise<MultichainSDKBase>;

export type * from './api/types';
