// packages/multichainapi/src/providers/MultichainProvider.ts
import type { Json } from '@metamask/utils';
import { ExtensionProvider } from './providers/ExtensionProvider';
import { LoggerLike, MultichainEvents, ScopedProperties, ScopeObject, SessionData, SessionEventData, SessionProperties } from './types';

export interface CreateSessionParams {
  requiredScopes?: Record<string, ScopeObject>;
  optionalScopes?: Record<string, ScopeObject>;
  scopedProperties?: ScopedProperties;
  sessionProperties?: SessionProperties;
}

const DEFAULT_SESSION_ID = 'SINGLE_SESSION_ONLY';

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
  private readonly logger?: LoggerLike;

  constructor(params?: { logger?: LoggerLike }) {
    this.logger = params?.logger ?? console;
    this.provider = new ExtensionProvider(params);

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
  private notify(event: 'notification', data: Json): void;
  private notify(event: keyof MultichainEvents, data: unknown): void {
    this.logger?.debug(`MetamaskMultichain received event: ${event} / type: ${typeof data}`, data);
    if (event === 'sessionChanged') {
      const sessionEventData = data as SessionEventData;
      // Update the session data
      this.sessions.set(sessionEventData.session.sessionId, sessionEventData.session);
      this.listeners.sessionChanged.forEach(listener => listener(sessionEventData));
    } else if (event === 'notification') {
      this.logger?.debug('[MetamaskMultichain] Received notification:', data);
      if(typeof data === 'object' && "method" in data && data.method === 'wallet_sessionChanged' && "params" in data && typeof data.params === 'object' && "sessionScopes" in data.params && typeof data.params.sessionScopes === 'object') {
        const updatedSessionScope = data.params as SessionData;
        const session = this.sessions.get(DEFAULT_SESSION_ID);
        this.logger?.debug('[MetamaskMultichain] wallet_sessionChanged received', {
          sessionId: DEFAULT_SESSION_ID,
          updatedSessionScope,
        });
        console.log('[MetamaskMultichain] Updated session:', this.sessions);
        if (session) {
          session.sessionScopes = updatedSessionScope.sessionScopes;
          session.sessionProperties = updatedSessionScope.sessionProperties;
          session.expiry = updatedSessionScope.expiry;
          session.sessionId = updatedSessionScope.sessionId;
          session.scopedProperties = updatedSessionScope.scopedProperties;
          this.sessions.set(DEFAULT_SESSION_ID, session);
          this.logger?.debug('[MetamaskMultichain] Updated session:', session);
          this.listeners.sessionChanged.forEach(listener => listener({
            type: 'updated',
            session,
          }));
        }
      } else {
        console.error('[MetamaskMultichain] Received unknown notification:', data);
        this.listeners.notification.forEach(listener => listener(data));
      }
    } else {
      console.error('[MetamaskMultichain] Received unknown event:', event, data);
    }
  }

  public async connect({ extensionId }: { extensionId: string }): Promise<boolean> {
    this.logger?.debug('[Caip25MultichainProvider] Connecting...');
    return this.provider.connect({ extensionId });
  }

  public disconnect(): void {
    this.logger?.debug('[Caip25MultichainProvider] Disconnecting...');
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
    this.logger?.debug('[Caip25MultichainProvider] createSession with params:', {
      requiredScopes,
      optionalScopes,
      scopedProperties,
      sessionProperties,
    });

    // Define default notifications for each chain
    const defaultNotifications = []; // wallet_notify?

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

    const params = {
      optionalScopes: formattedOptionalScopes,
      // Only include other params if they're not empty
      ...(Object.keys(requiredScopes).length > 0 && { requiredScopes }),
      ...(Object.keys(scopedProperties).length > 0 && { scopedProperties }),
      ...(Object.keys(sessionProperties).length > 0 && { sessionProperties }),
    };

    this.logger?.debug('[MetamaskMultichain] Creating session with params:', params);

    const result = (await this.provider.request({
      method: 'wallet_createSession',
      params,
    })) as SessionData;

    this.logger?.debug('[Caip25MultichainProvider] wallet_createSession response:', result);

    const sessionId = result.sessionId ?? DEFAULT_SESSION_ID;
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
  public async revokeSession(params?: { sessionId?: string }): Promise<boolean> {

    let idToUse =  params?.sessionId ?? DEFAULT_SESSION_ID;
    const session = this.sessions.get(idToUse);
    if (!session) {
      this.logger?.debug('[Caip25MultichainProvider] No session found to revoke for:', idToUse);
      return false;
    }

    this.logger?.debug('[Caip25MultichainProvider] Revoking session:', idToUse);

    await this.provider.request({
      method: 'wallet_revokeSession',
      params: [idToUse],
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
  public async getSession(params?: { sessionId?: string }): Promise<SessionData | null> {
    const idToUse = params?.sessionId ?? DEFAULT_SESSION_ID;
    const session = this.sessions.get(idToUse);
    if (!session) {
      this.logger?.debug('[Caip25MultichainProvider] Session not found:', idToUse);
      // call wallet_getSession to get the session
      const result = (await this.provider.request({
        method: 'wallet_getSession',
        params: [idToUse],
      })) as SessionData;
      this.sessions.set(idToUse, result);
      return result;
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
    this.logger?.debug('[Caip25MultichainProvider] Invoking method:', request.method, 'on scope:', scope);

    const result = (await this.provider.request({
      method: 'wallet_invokeMethod',
      params: { scope, request },
    })) as Json;

    return result;
  }
}
