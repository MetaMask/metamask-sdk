// packages/sdk-multichain/src/providers/MultichainProvider.ts
import type { Json } from '@metamask/utils';
import { ExtensionProvider, ProviderType } from './providers/ExtensionProvider';
import { LoggerLike, MultichainEvents, ScopedProperties, ScopeObject, SessionData, SessionEventData, SessionProperties } from './types';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { Duplex } from 'readable-stream';

export interface CreateSessionParams {
  requiredScopes?: Record<string, ScopeObject>;
  optionalScopes?: Record<string, ScopeObject>;
  scopedProperties?: ScopedProperties;
  sessionProperties?: SessionProperties;
}

const DEFAULT_SESSION_ID = 'SINGLE_SESSION_ONLY';

interface MetamaskMultichainParams {
  logger?: LoggerLike;
  existingProvider?: MetaMaskInpageProvider;
  existingStream?: Duplex;
  preferredProvider?: ProviderType;
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
  private readonly logger?: LoggerLike;

  constructor(params?: MetamaskMultichainParams) {
    this.logger = params?.logger ?? console;

    this.logger?.debug('[MetamaskMultichain] Initializing with params:', {
      hasExistingProvider: !!params?.existingProvider,
      hasExistingStream: !!params?.existingStream,
      preferredProvider: params?.preferredProvider,
    });

    this.provider = new ExtensionProvider({
      logger: this.logger,
      existingProvider: params?.existingProvider,
      existingStream: params?.existingStream,
      preferredProvider: params?.preferredProvider,
    });

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

  private notify<K extends keyof MultichainEvents>(
    event: K,
    data: Parameters<MultichainEvents[K]>[0],
  ): void {
    this.logger?.debug(
      `MetamaskMultichain received event: ${event} / type: ${typeof data}`,
      data,
    );

    if (event === 'sessionChanged') {
      const sessionEventData = data as SessionEventData;
      // Update the session data
      this.sessions.set(sessionEventData.session.sessionId, sessionEventData.session);
      this.listeners.sessionChanged.forEach((listener) => listener(sessionEventData));
    } else if (event === 'notification') {
      this.logger?.debug('[MetamaskMultichain] Received notification:', data);
      if (
        typeof data === 'object' &&
        data !== null &&
        'method' in data &&
        (data as any).method === 'wallet_sessionChanged' &&
        'params' in data &&
        typeof (data as any).params === 'object' &&
        'sessionScopes' in (data as any).params
      ) {
        const updatedSessionScope = (data as any).params as SessionData;
        const session = this.sessions.get(DEFAULT_SESSION_ID);

        this.logger?.debug('[MetamaskMultichain] wallet_sessionChanged received', {
          sessionId: DEFAULT_SESSION_ID,
          updatedSessionScope,
        });

        if (session) {
          session.sessionScopes = updatedSessionScope.sessionScopes;
          session.sessionProperties = updatedSessionScope.sessionProperties;
          session.expiry = updatedSessionScope.expiry;
          session.sessionId = updatedSessionScope.sessionId;
          session.scopedProperties = updatedSessionScope.scopedProperties;

          this.sessions.set(DEFAULT_SESSION_ID, session);
          this.logger?.debug('[MetamaskMultichain] Updated session:', session);

          this.logger?.debug(`[MetamaskMultichain] Notifying sessionChanged listeners ${this.listeners.sessionChanged.size}`);
          this.listeners.sessionChanged.forEach((listener) => listener({
            type: 'updated',
            session,
          }));
        }
      } else {
        console.error('[MetamaskMultichain] Received unknown notification:', data);
        this.listeners.notification.forEach((listener) => listener(data));
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
    // Clear all sessions
    this.sessions.clear();
    // Clear all listeners
    this.listeners.sessionChanged.clear();
    this.listeners.notification.clear();
    // Disconnect the provider
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
    const defaultNotifications: string[] = []; // wallet_notify?

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
      params: params as unknown as Json,
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
   * Invoke a method (CAIP-27 style) within a particular scope.
   */
  public async invokeMethod({
    scope,
    request,
  }: {
    scope: string;
    request: { method: string; params: Json[] };
  }): Promise<Json> {
    this.logger?.debug('[Caip25MultichainProvider] Invoking method:', request.method, 'on scope:', scope);


    //TODO: validate here or just let the wallet handle it?
    // https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-27.md
    // The JSON-RPC method is labeled as wallet_invokeMethod and expects three parameters, two of them required:
    // sessionId (conditional) - CAIP-171 SessionId disambiguates an open session in a multi-session actor; it is required in some sessions, such as CAIP-25 sessions created by a response containing one, and SHOULD be omitted in other sessions, such as CAIP-25 sessions created by a response not containing one (see CAIP-316).
    // scope (required) - a valid CAIP-2 network identifier, previously authorized by or within a scopeObject in the active session
    // request (required) - an object containing the fields:
    // method (required) - the JSON-RPC method to invoke (previously authorized for the targeted network)
    // params (required) - JSON-RPC parameters to invoke (may be empty but must be set)

    //     Validation
    // A respondent SHOULD check the scope against active session's scopeObjects before executing or responding to such a request, and SHOULD invalidate a request for a scope not previously authorized.
    // The respondent SHOULD check that request.method is authorized for the specified scope, and SHOULD invalidate a request for a scope not previously authorized.
    // The respondent MAY check that the request.params are valid for request.method, if its syntax is known to it.
    // The respondent MAY apply other logic or validation.
    // The respondent MAY chose to drop invalid requests or return an error message, but it MUST NOT route or submit them.

    const result = (await this.provider.request({
      method: 'wallet_invokeMethod',
      params: { scope, request },
    })) as Json;

    return result;
  }
}
