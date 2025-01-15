// packages/multichainapi/src/MultichainProvider.ts
import { EventEmitter2 } from 'eventemitter2';
import type { SessionData, MethodParams, SessionEventData } from '../types';
import { ExtensionProvider } from './extensions/ExtensionProvider';
import { FEATURED_NETWORKS } from '../constants/networks';
import { Eip155Methods } from '../constants/methods';

export class MultichainProvider extends EventEmitter2 {
  private sessions: Map<string, SessionData> = new Map();
  private provider: ExtensionProvider;

  constructor() {
    super();
    this.provider = new ExtensionProvider();
  }

  async connect(extensionId: string): Promise<boolean> {
    return this.provider.connect(extensionId);
  }

  async createSession(chainId: string, account: string): Promise<SessionData> {
    if (!FEATURED_NETWORKS[chainId as keyof typeof FEATURED_NETWORKS]) {
      throw new Error(`Unsupported chainId: ${chainId}`);
    }

    const session: SessionData = {
      id: crypto.randomUUID(),
      chainId,
      account,
      expiry: Date.now() + 3600000, // 1 hour from now
    };

    this.sessions.set(session.id, session);
    this.emit('sessionChanged', {
      type: 'created',
      session,
    } as SessionEventData);

    return session;
  }

  async invokeMethod(params: MethodParams): Promise<unknown> {
    if (!Eip155Methods.includes(params.method)) {
      throw new Error(`Unsupported method: ${params.method}`);
    }
    return this.provider.request(params);
  }

  async getSession(sessionId: string): Promise<SessionData | undefined> {
    return this.sessions.get(sessionId);
  }

  async revokeSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.delete(sessionId);
      this.emit('sessionChanged', {
        type: 'revoked',
        session,
      } as SessionEventData);
      return true;
    }
    return false;
  }
}
