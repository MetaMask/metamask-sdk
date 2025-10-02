import { type CreateSessionParams, TransportTimeoutError, type TransportRequest, type TransportResponse } from '@metamask/multichain-api-client';
import type { Session, SessionRequest } from '@metamask/mobile-wallet-protocol-core';
import { SessionStore } from '@metamask/mobile-wallet-protocol-core';
import type { DappClient } from '@metamask/mobile-wallet-protocol-dapp-client';

import type { ExtendedTransport, RPCAPI, Scope, SessionData, StoreAdapter } from '../../../domain';
import type { CaipAccountId } from '@metamask/utils';
import { addValidAccounts, getOptionalScopes, getValidAccounts } from '../../utils';

const DEFAULT_REQUEST_TIMEOUT = 60 * 1000;
const CONNECTION_GRACE_PERIOD = 10 * 1000;

const DEFAULT_CONNECTION_TIMEOUT = DEFAULT_REQUEST_TIMEOUT + CONNECTION_GRACE_PERIOD;

type PendingRequests = {
	method: string;
	resolve: (value: TransportResponse<unknown>) => void;
	reject: (error: Error) => void;
	timeout: NodeJS.Timeout;
};

/**
 * Mobile Wallet Protocol transport implementation
 * Bridges the MWP DappClient with the multichain API client Transport interface
 */
export class MWPTransport implements ExtendedTransport {
	private __reqId = 0;
	private __pendingRequests = new Map<string, PendingRequests>();
	private notificationCallbacks = new Set<(data: unknown) => void>();
	private currentSessionRequest: SessionRequest | undefined;
	private connectionPromise?: Promise<void>;

	get pendingRequests() {
		return this.__pendingRequests;
	}

	set pendingRequests(pendingRequests: Map<string, PendingRequests>) {
		this.__pendingRequests = pendingRequests;
	}

	get sessionRequest() {
		return this.currentSessionRequest;
	}

	constructor(
		private dappClient: DappClient,
		private kvstore: StoreAdapter,
		private options: { requestTimeout: number; connectionTimeout: number } = { requestTimeout: DEFAULT_REQUEST_TIMEOUT, connectionTimeout: DEFAULT_CONNECTION_TIMEOUT },
	) {
		this.dappClient.on('message', this.handleMessage.bind(this));
		if (typeof window !== 'undefined') {
			window.addEventListener('focus', this.onWindowFocus.bind(this));
		}
	}

	private onWindowFocus(): void {
		if (!this.isConnected()) {
			this.dappClient.reconnect();
		}
	}

	private notifyCallbacks(data: unknown): void {
		this.notificationCallbacks.forEach((callback) => callback(data));
	}

	private rejectRequest(id: string, error = new Error('Request rejected')): void {
		const request = this.pendingRequests.get(id);
		if (request) {
			this.pendingRequests.delete(id);
			clearTimeout(request.timeout);
			request.reject(error);
		}
	}

	private handleMessage(message: unknown): void {
		if (typeof message === 'object' && message !== null) {
			if ('data' in message) {
				const messagePayload = message.data as Record<string, unknown>;
				if ('id' in messagePayload && typeof messagePayload.id === 'string') {
					const request = this.pendingRequests.get(messagePayload.id);
					if (request) {
						const requestWithName = {
							...messagePayload,
							method: request.method === 'wallet_getSession' || request.method === 'wallet_createSession' ? 'wallet_sessionChanged' : request.method,
						} as unknown as TransportResponse<unknown>;
						clearTimeout(request.timeout);
						request.resolve(requestWithName);
						this.pendingRequests.delete(messagePayload.id);
						return;
					}
				} else if ('name' in message && message.name === 'metamask-multichain-provider' && messagePayload.method === 'wallet_sessionChanged') {
					this.notifyCallbacks(message.data);
					return;
				}
			}
		}
	}

	private async onResumeSuccess(resumeResolve: () => void, resumeReject: (err: Error) => void, options?: { scopes: Scope[]; caipAccountIds: CaipAccountId[] }): Promise<void> {
		try {
			const sessionRequest = await this.request({ method: 'wallet_getSession' });
			let walletSession = sessionRequest.result as SessionData;
			if (options) {
				const currentScopes = Object.keys(walletSession?.sessionScopes ?? {}) as Scope[];
				const proposedScopes = options?.scopes ?? [];
				const isSameScopes = currentScopes.every((scope) => proposedScopes.includes(scope)) && proposedScopes.every((scope) => currentScopes.includes(scope));
				if (!isSameScopes) {
					const optionalScopes = addValidAccounts(getOptionalScopes(options?.scopes ?? []), getValidAccounts(options?.caipAccountIds ?? []));
					const sessionRequest: CreateSessionParams<RPCAPI> = { optionalScopes };
					const response = await this.request({ method: 'wallet_createSession', params: sessionRequest });
					await this.request({ method: 'wallet_revokeSession', params: walletSession });
					walletSession = response.result as SessionData;
				}
			}
			this.notifyCallbacks({
				method: 'wallet_sessionChanged',
				params: walletSession,
			});
			resumeResolve();
		} catch (err) {
			resumeReject(err);
		}
	}

	/**
	 * Establishes a connection using the Mobile Wallet Protocol
	 * Note: This is a simplified implementation that expects the DappClient to be provided externally
	 */
	async connect(options?: { scopes: Scope[]; caipAccountIds: CaipAccountId[] }): Promise<void> {
		const { dappClient, kvstore } = this;
		const sessionStore = new SessionStore(kvstore);

		let session: Session | undefined;
		try {
			const [activeSession] = await sessionStore.list();
			if (activeSession) {
				session = activeSession;
			}
		} catch {}

		let timeout: NodeJS.Timeout;
		this.connectionPromise ??= new Promise<void>((resolve, reject) => {
			let connection: Promise<void>;
			if (session) {
				connection = new Promise<void>((resumeResolve, resumeReject) => {
					if (this.dappClient.state === 'CONNECTED') {
						this.onResumeSuccess(resumeResolve, resumeReject, options);
					} else {
						this.dappClient.once('connected', async () => {
							this.onResumeSuccess(resumeResolve, resumeReject, options);
						});
						dappClient.resume(session.id);
					}
				});
			} else {
				connection = new Promise<void>((resolveConnection, rejectConnection) => {
					this.dappClient.on('message', async (message: unknown) => {
						if (typeof message === 'object' && message !== null) {
							if ('data' in message) {
								const messagePayload = message.data as Record<string, unknown>;
								if (messagePayload.method === 'wallet_createSession' || messagePayload.method === 'wallet_sessionChanged') {
									if (messagePayload.error) {
										return rejectConnection(messagePayload.error);
									}
									this.notifyCallbacks(message.data);
									return resolveConnection();
								}
							}
						}
					});
					const optionalScopes = addValidAccounts(getOptionalScopes(options?.scopes ?? []), getValidAccounts(options?.caipAccountIds ?? []));
					const sessionRequest: CreateSessionParams<RPCAPI> = { optionalScopes };
					const request = { jsonrpc: '2.0', id: `${this.__reqId++}`, method: 'wallet_createSession', params: sessionRequest };

					dappClient.connect({ mode: 'trusted', initialPayload: request }).catch(rejectConnection);
				});
			}
			timeout = setTimeout(() => {
				reject(new TransportTimeoutError());
			}, this.options.connectionTimeout);
			connection.then(resolve).catch(reject);
		});

		return this.connectionPromise.finally(() => {
			this.connectionPromise = undefined;
			if (timeout) {
				clearTimeout(timeout);
			}
		});
	}

	/**
	 * Disconnects from the Mobile Wallet Protocol
	 */
	async disconnect(): Promise<void> {
		return this.dappClient.disconnect();
	}

	/**
	 * Checks if the transport is connected
	 */
	isConnected(): boolean {
		// biome-ignore lint/suspicious/noExplicitAny:  required if state is not made public in dappClient
		return (this.dappClient as any).state === 'CONNECTED';
	}

	/**
	 * Sends a request through the Mobile Wallet Protocol
	 */
	async request<TRequest extends TransportRequest, TResponse extends TransportResponse>(payload: TRequest, options?: { timeout?: number }): Promise<TResponse> {
		this.__reqId += 1;
		const response = await new Promise<TResponse>((resolve, reject) => {
			const request = {
				jsonrpc: '2.0',
				id: `${this.__reqId}`,
				...payload,
			};
			const timeout = setTimeout(() => {
				this.rejectRequest(request.id, new TransportTimeoutError());
			}, options?.timeout ?? this.options.requestTimeout);

			this.pendingRequests.set(request.id, { method: payload.method, resolve: resolve as (value: TransportResponse<unknown>) => void, reject, timeout });
			this.dappClient.sendRequest(request).catch(reject);
		});
		return response;
	}

	/**
	 * Registers a callback for notifications from the wallet
	 */
	onNotification(callback: (data: unknown) => void): () => void {
		this.notificationCallbacks.add(callback);
		return () => {
			this.notificationCallbacks.delete(callback);
		};
	}
}
