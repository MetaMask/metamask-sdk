// packages/multichainapi/src/providers/MultichainProvider.ts
import type { Json } from '@metamask/utils';
import { ExtensionProvider } from './providers/ExtensionProvider';
import { MultichainEvents, ScopedProperties, ScopeObject, SessionData, SessionEventData, SessionProperties } from './types';

export interface CreateSessionParams {
  requiredScopes?: Record<string, ScopeObject>;
  optionalScopes?: Record<string, ScopeObject>;
  scopedProperties?: ScopedProperties;
  sessionProperties?: SessionProperties;
}

/**
 * A CAIP-25-compliant provider that uses ExtensionProvider for transport.
 */
export class MetamaskMultichain {
  private readonly sessions: Map<string, SessionData> = new Map();
  private readonly provider: ExtensionProvider;
  private readonly listeners: {
    sessionChanged: Set<(data: SessionEventData) => void>;
    notification: Set<(data: unknown) => void>;
  } = {
    sessionChanged: new Set(),
    notification: new Set()
  };

  constructor() {
    this.provider = new ExtensionProvider();

    this.provider.onNotification((notification) => {
      this.notify('notification', notification);
    });
  }

  public addListener<K extends keyof MultichainEvents>(
    event: K,
    listener: MultichainEvents[K]
  ): void {
    this.listeners[event].add(listener);
  }

  public removeListener<K extends keyof MultichainEvents>(
    event: K,
    listener: MultichainEvents[K]
  ): void {
    this.listeners[event].delete(listener);
  }

  private notify(event: 'sessionChanged', data: SessionEventData): void;
  private notify(event: 'notification', data: unknown): void;
  private notify(event: keyof MultichainEvents, data: unknown): void {
    if (event === 'sessionChanged') {
      this.listeners.sessionChanged.forEach(listener => listener(data as SessionEventData));
    } else {
      this.listeners.notification.forEach(listener => listener(data));
    }
  }

  public async connect({ extensionId }: { extensionId: string }): Promise<boolean> {
    console.debug('[Caip25MultichainProvider] Connecting...');
    return this.provider.connect({ extensionId });
  }

  public disconnect(): void {
    console.debug('[Caip25MultichainProvider] Disconnecting...');
    this.provider.disconnect();
  }

  /**
   * Create or update a CAIP-25 session.
   */
  public async createSession({
    requiredScopes = {},
    optionalScopes = {},
    scopedProperties = {},
    sessionProperties = {},
  }: CreateSessionParams): Promise<SessionData> {
    console.debug('[Caip25MultichainProvider] createSession with params:', {
      requiredScopes,
      optionalScopes,
      scopedProperties,
      sessionProperties,
    });

    // Define default notifications for each chain
    const defaultNotifications = [];

    // Format scopes with notifications
    const formattedOptionalScopes = Object.entries(optionalScopes).reduce(
      (acc, [chainId, scope]) => ({
        ...acc,
        [chainId]: {
          methods: Array.isArray(scope.methods) ? scope.methods : [],
          notifications: defaultNotifications,
          accounts: Array.isArray(scope.accounts) ? scope.accounts : [],
        },
      }),
      {}
    );

    const result = (await this.provider.request({
      method: 'wallet_createSession',
      params: {
        optionalScopes: formattedOptionalScopes,
        // Only include other params if they're not empty
        ...(Object.keys(requiredScopes).length > 0 && { requiredScopes }),
        ...(Object.keys(scopedProperties).length > 0 && { scopedProperties }),
        ...(Object.keys(sessionProperties).length > 0 && { sessionProperties }),
      },
    })) as SessionData;

    console.debug('[Caip25MultichainProvider] wallet_createSession response:', result);

    const sessionId = result.sessionId ?? 'SINGLE_SESSION_ONLY';
    const sessionRecord: SessionData = {
      sessionId: result.sessionId,
      sessionScopes: result.sessionScopes,
      scopedProperties: result.scopedProperties,
      sessionProperties: result.sessionProperties,
      expiry: result.sessionProperties?.expiry as string | undefined,
    };

    this.sessions.set(sessionId, sessionRecord);

    this.notify('sessionChanged', {
      type: 'created',
      session: sessionRecord,
    });

    return result;
  }

  /**
   * Revoke a CAIP-25 session.
   */
  public async revokeSession({ sessionId }: { sessionId?: string }): Promise<boolean> {
    const idToUse = sessionId ?? 'SINGLE_SESSION_ONLY';
    const session = this.sessions.get(idToUse);
    if (!session) {
      console.debug('[Caip25MultichainProvider] No session found to revoke for:', idToUse);
      return false;
    }

    console.debug('[Caip25MultichainProvider] Revoking session:', idToUse);

    await this.provider.request({
      method: 'wallet_revokeSession',
      params: sessionId ? [sessionId] : [],
    });

    this.sessions.delete(idToUse);
    this.notify('sessionChanged', {
      type: 'revoked',
      session: session,
    });

    return true;
  }

  /**
   * Retrieve a stored session record, defaulting to single-session usage if none is specified.
   */
  public async getSession({ sessionId }: { sessionId?: string }): Promise<SessionData | null> {
    const idToUse = sessionId ?? 'SINGLE_SESSION_ONLY';
    const session = this.sessions.get(idToUse);
    if (!session) {
      console.debug('[Caip25MultichainProvider] Session not found:', idToUse);
      return null;
    }
    return session;
  }

  /**
   * Invoke a method (CAIP-25 style) within a particular scope.
   */
  public async invokeMethod({
    scope,
    request,
  }: {
    scope: string;
    request: { method: string; params: Json[] };
  }): Promise<Json> {
    console.debug('[Caip25MultichainProvider] Invoking method:', request.method, 'on scope:', scope);

    const result = (await this.provider.request({
      method: 'wallet_invokeMethod',
      params: { scope, request },
    })) as Json;

    return result;
  }
}
