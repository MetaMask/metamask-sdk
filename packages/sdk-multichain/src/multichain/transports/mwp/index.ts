import { type CreateSessionParams, TransportTimeoutError, type TransportRequest, type TransportResponse } from '@metamask/multichain-api-client';
import type { Session, SessionRequest } from '@metamask/mobile-wallet-protocol-core';
import { SessionStore } from '@metamask/mobile-wallet-protocol-core';
import type { DappClient } from '@metamask/mobile-wallet-protocol-dapp-client';

import { createLogger, type ExtendedTransport, type RPCAPI, type Scope, type SessionData, type StoreAdapter } from '../../../domain';
import type { CaipAccountId } from '@metamask/utils';
import { addValidAccounts, getOptionalScopes, getValidAccounts, isSameScopesAndAccounts } from '../../utils';

const DEFAULT_REQUEST_TIMEOUT = 60 * 1000;
const CONNECTION_GRACE_PERIOD = 60 * 1000;
const DEFAULT_CONNECTION_TIMEOUT = DEFAULT_REQUEST_TIMEOUT + CONNECTION_GRACE_PERIOD;
const SESSION_STORE_KEY = 'cache_wallet_getSession';

const CACHED_METHOD_LIST = ['wallet_getSession', 'wallet_createSession', 'wallet_sessionChanged'];
const CACHED_RESET_METHOD_LIST = ['wallet_revokeSession'];

type PendingRequests = {
	request: { jsonrpc: string; id: string } & TransportRequest;
	method: string;
	resolve: (value: TransportResponse<unknown>) => void;
	reject: (error: Error) => void;
	timeout: NodeJS.Timeout;
};

const logger = createLogger('metamask-sdk:transport');

/**
 * Mobile Wallet Protocol transport implementation
 * Bridges the MWP DappClient with the multichain API client Transport interface
 */
export class MWPTransport implements ExtendedTransport {
	private __reqId = 0;
	private __pendingRequests = new Map<string, PendingRequests>();
	private notificationCallbacks = new Set<(data: unknown) => void>();
	private currentSessionRequest: SessionRequest | undefined;

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
		if (typeof window !== 'undefined' && typeof window.addEventListener !== 'undefined') {
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
						} as unknown as { jsonrpc: string; id: string } & TransportResponse<unknown>;

						const notification = {
							...messagePayload,
							method: request.method === 'wallet_getSession' || request.method === 'wallet_createSession' ? 'wallet_sessionChanged' : request.method,
							params: requestWithName.result,
						};

						// if (CACHED_METHOD_LIST.includes(notification.method)) {
						// 	this.storeWalletSession(request.request, notification as unknown as TransportResponse);
						// }
						clearTimeout(request.timeout);
						this.notifyCallbacks(notification);
						request.resolve(requestWithName);
						this.pendingRequests.delete(messagePayload.id);
						return;
					}
				} else {
					this.notifyCallbacks(message.data);
				}
			}
		}
	}

	private async onResumeSuccess(resumeResolve: () => void, resumeReject: (err: Error) => void, options?: { scopes: Scope[]; caipAccountIds: CaipAccountId[] }): Promise<void> {
		try {
			const sessionRequest = await this.request({ method: 'wallet_getSession' });
			if (sessionRequest.error) {
				return resumeReject(new Error(sessionRequest.error.message));
			}
			let walletSession = sessionRequest.result as SessionData;
			if (walletSession && options) {
				const currentScopes = Object.keys(walletSession?.sessionScopes ?? {}) as Scope[];
				const proposedScopes = options?.scopes ?? [];
        const proposedCaipAccountIds = options?.caipAccountIds ?? [];
        const hasSameScopesAndAccounts = isSameScopesAndAccounts(currentScopes, proposedScopes, walletSession, proposedCaipAccountIds);
        if (!hasSameScopesAndAccounts) {
					const optionalScopes = addValidAccounts(getOptionalScopes(options?.scopes ?? []), getValidAccounts(options?.caipAccountIds ?? []));
					const sessionRequest: CreateSessionParams<RPCAPI> = { optionalScopes };
					const response = await this.request({ method: 'wallet_createSession', params: sessionRequest });
					if (response.error) {
						return resumeReject(new Error(response.error.message));
					}
					//TODO: Maybe find a better way to revoke sessions on wallet without triggering an empty notification
					//Issue of this is it will send a session update event with an empty session and right after we may get the session recovered
					//await this.request({ method: 'wallet_revokeSession', params: walletSession });
					walletSession = response.result as SessionData;
				}
			} else if (!walletSession) {
				const optionalScopes = addValidAccounts(getOptionalScopes(options?.scopes ?? []), getValidAccounts(options?.caipAccountIds ?? []));
				const sessionRequest: CreateSessionParams<RPCAPI> = { optionalScopes };
				const response = await this.request({ method: 'wallet_createSession', params: sessionRequest });
				if (response.error) {
					return resumeReject(new Error(response.error.message));
				}
				walletSession = response.result as SessionData;
			}
			this.notifyCallbacks({
				method: 'wallet_sessionChanged',
				params: walletSession,
			});
			return resumeResolve();
		} catch (err) {
			return resumeReject(err);
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
				logger('active session found', activeSession);
				session = activeSession;
			}
		} catch {}

		let timeout: NodeJS.Timeout;
		const connectionPromise = new Promise<void>((resolve, reject) => {
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
					const optionalScopes = addValidAccounts(getOptionalScopes(options?.scopes ?? []), getValidAccounts(options?.caipAccountIds ?? []));
					const sessionRequest: CreateSessionParams<RPCAPI> = { optionalScopes };
					const request = { jsonrpc: '2.0', id: `${this.__reqId++}`, method: 'wallet_createSession', params: sessionRequest };

					this.dappClient.on('message', async (message: unknown) => {
						if (typeof message === 'object' && message !== null) {
							if ('data' in message) {
								const messagePayload = message.data as Record<string, unknown>;
								if (messagePayload.method === 'wallet_createSession' || messagePayload.method === 'wallet_sessionChanged') {
									if (messagePayload.error) {
										return rejectConnection(messagePayload.error);
									}
									this.notifyCallbacks(message.data);
									await this.storeWalletSession(request, messagePayload as TransportResponse);
									return resolveConnection();
								}
							}
						}
					});

					dappClient.connect({ mode: 'trusted', initialPayload: request }).catch(rejectConnection);
				});
			}

			timeout = setTimeout(() => {
				reject(new TransportTimeoutError());
			}, this.options.connectionTimeout);

			connection.then(resolve).catch(reject);
		});

		return connectionPromise.finally(() => {
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

	private async fetchCachedWalletSession(request: { jsonrpc: string; id: string } & TransportRequest): Promise<TransportResponse | undefined> {
		if (request.method === 'wallet_getSession') {
			const walletGetSession = await this.kvstore.get(SESSION_STORE_KEY);
			if (walletGetSession) {
				const walletSession = JSON.parse(walletGetSession);
				return {
					id: request.id,
					jsonrpc: '2.0',
					result: walletSession.params || walletSession.result,
					method: request.method,
				} as TransportResponse;
			}
		}
	}

	private async storeWalletSession(request: TransportRequest, response: TransportResponse): Promise<void> {
		if (CACHED_METHOD_LIST.includes(request.method)) {
			await this.kvstore.set(SESSION_STORE_KEY, JSON.stringify(response));
		} else if (CACHED_RESET_METHOD_LIST.includes(request.method)) {
			await this.kvstore.delete(SESSION_STORE_KEY);
		}
	}

	/**
	 * Sends a request through the Mobile Wallet Protocol
	 */
	async request<TRequest extends TransportRequest, TResponse extends TransportResponse>(payload: TRequest, options?: { timeout?: number }): Promise<TResponse> {
		const request = {
			jsonrpc: '2.0',
			id: `${this.__reqId++}`,
			...payload,
		};

		const cachedWalletSession = await this.fetchCachedWalletSession(request);
		if (cachedWalletSession) {
			this.notifyCallbacks(cachedWalletSession);
			return cachedWalletSession as TResponse;
		}

		return new Promise<TResponse>((resolve, reject) => {
			const timeout = setTimeout(() => {
				this.rejectRequest(request.id, new TransportTimeoutError());
			}, options?.timeout ?? this.options.requestTimeout);

			this.pendingRequests.set(request.id, {
				request,
				method: request.method,
				resolve: async (response: TransportResponse<unknown>) => {
					if (CACHED_METHOD_LIST.includes(request.method)) {
						await this.storeWalletSession(request, response);
					}
					return resolve(response as TResponse);
				},
				reject,
				timeout,
			});

			this.dappClient.sendRequest(request).catch(reject);
		});
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
