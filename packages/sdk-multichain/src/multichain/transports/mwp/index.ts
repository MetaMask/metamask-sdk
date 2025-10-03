import { type CreateSessionParams, TransportTimeoutError, type TransportRequest, type TransportResponse } from '@metamask/multichain-api-client';
import type { Session, SessionRequest } from '@metamask/mobile-wallet-protocol-core';
import { SessionStore } from '@metamask/mobile-wallet-protocol-core';
import type { DappClient } from '@metamask/mobile-wallet-protocol-dapp-client';

import { createLogger, type ExtendedTransport, type RPCAPI, type Scope, type SessionData, type StoreAdapter } from '../../../domain';
import type { CaipAccountId } from '@metamask/utils';
import { addValidAccounts, getOptionalScopes, getValidAccounts } from '../../utils';

const DEFAULT_REQUEST_TIMEOUT = 60 * 1000;
const CONNECTION_GRACE_PERIOD = 60 * 1000;

const DEFAULT_CONNECTION_TIMEOUT = DEFAULT_REQUEST_TIMEOUT + CONNECTION_GRACE_PERIOD;

type PendingRequests = {
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
		logger('MWPTransport created');
		this.dappClient.on('message', this.handleMessage.bind(this));
		if (typeof window !== 'undefined') {
			window.addEventListener('focus', this.onWindowFocus.bind(this));
		}
	}

	private onWindowFocus(): void {
		logger('onWindowFocus', this.isConnected());
		if (!this.isConnected()) {
			logger('reconnecting...');
			this.dappClient.reconnect();
		}
	}

	private notifyCallbacks(data: unknown): void {
		logger('notifyCallbacks', data);
		this.notificationCallbacks.forEach((callback) => callback(data));
	}

	private rejectRequest(id: string, error = new Error('Request rejected')): void {
		const request = this.pendingRequests.get(id);
		if (request) {
			logger(`rejectRequest ${id}`, request.method, error);
			this.pendingRequests.delete(id);
			clearTimeout(request.timeout);
			request.reject(error);
		}
	}

	private handleMessage(message: unknown): void {
		logger('handleMessage', message);
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
						const notification = {
							method: request.method === 'wallet_getSession' || request.method === 'wallet_createSession' ? 'wallet_sessionChanged' : request.method,
							params: requestWithName.result,
						};
						logger(`resolving request ${messagePayload.id}`, requestWithName);
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
		logger('onResumeSuccess', options);
		try {
			const sessionRequest = await this.request({ method: 'wallet_getSession' });
			if (sessionRequest.error) {
				logger('onResumeSuccess error', sessionRequest.error);
				resumeReject(new Error(sessionRequest.error.message));
				return;
			}
			let walletSession = sessionRequest.result as SessionData;
			if (walletSession && options) {
				const currentScopes = Object.keys(walletSession?.sessionScopes ?? {}) as Scope[];
				const proposedScopes = options?.scopes ?? [];
				const isSameScopes = currentScopes.every((scope) => proposedScopes.includes(scope)) && proposedScopes.every((scope) => currentScopes.includes(scope));
				logger('onResumeSuccess isSameScopes', isSameScopes, currentScopes, proposedScopes);
				if (!isSameScopes) {
					const optionalScopes = addValidAccounts(getOptionalScopes(options?.scopes ?? []), getValidAccounts(options?.caipAccountIds ?? []));
					const sessionRequest: CreateSessionParams<RPCAPI> = { optionalScopes };
					logger('onResumeSuccess creating a new session', sessionRequest);
					const response = await this.request({ method: 'wallet_createSession', params: sessionRequest });
					if (response.error) {
						resumeReject(new Error(response.error.message));
					}
					logger('onResumeSuccess revoking old session', walletSession);
					await this.request({ method: 'wallet_revokeSession', params: walletSession });
					walletSession = response.result as SessionData;
				}
			} else if (!walletSession) {
				const optionalScopes = addValidAccounts(getOptionalScopes(options?.scopes ?? []), getValidAccounts(options?.caipAccountIds ?? []));
				const sessionRequest: CreateSessionParams<RPCAPI> = { optionalScopes };
				const response = await this.request({ method: 'wallet_createSession', params: sessionRequest });
				if (response.error) {
					resumeReject(new Error(response.error.message));
				}
				walletSession = response.result as SessionData;
			}
			this.notifyCallbacks({
				method: 'wallet_sessionChanged',
				params: walletSession,
			});
			logger('onResumeSuccess finished');
			resumeResolve();
		} catch (err) {
			logger('onResumeSuccess error', err);
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
				logger('active session found', activeSession);
				session = activeSession;
			}
		} catch {}

		let timeout: NodeJS.Timeout;
		const connectionPromise = new Promise<void>((resolve, reject) => {
			let connection: Promise<void>;
			if (session) {
				logger('resuming session...');
				connection = new Promise<void>((resumeResolve, resumeReject) => {
					if (this.dappClient.state === 'CONNECTED') {
						logger('already connected, onResumeSuccess');
						this.onResumeSuccess(resumeResolve, resumeReject, options);
					} else {
						logger('connecting...');
						this.dappClient.once('connected', async () => {
							logger('connected');
							this.onResumeSuccess(resumeResolve, resumeReject, options);
						});
						dappClient.resume(session.id);
					}
				});
			} else {
				logger('creating new session...');
				connection = new Promise<void>((resolveConnection, rejectConnection) => {
					this.dappClient.on('message', async (message: unknown) => {
						if (typeof message === 'object' && message !== null) {
							if ('data' in message) {
								const messagePayload = message.data as Record<string, unknown>;
								if (messagePayload.method === 'wallet_createSession' || messagePayload.method === 'wallet_sessionChanged') {
									if (messagePayload.error) {
										logger('connection error', messagePayload.error);
										return rejectConnection(messagePayload.error);
									}
									logger('session created/changed');
									this.notifyCallbacks(message.data);
									return resolveConnection();
								}
							}
						}
					});
					const optionalScopes = addValidAccounts(getOptionalScopes(options?.scopes ?? []), getValidAccounts(options?.caipAccountIds ?? []));
					const sessionRequest: CreateSessionParams<RPCAPI> = { optionalScopes };
					const request = { jsonrpc: '2.0', id: `${this.__reqId++}`, method: 'wallet_createSession', params: sessionRequest };

					logger('connecting with new session request', request);
					dappClient.connect({ mode: 'trusted', initialPayload: request }).catch(rejectConnection);
				});
			}

			timeout = setTimeout(() => {
				logger('connection timeout');
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
		logger('disconnecting...');
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
			logger('sending request', request);
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
		logger('onNotification registered');
		this.notificationCallbacks.add(callback);
		return () => {
			logger('onNotification unregistered');
			this.notificationCallbacks.delete(callback);
		};
	}
}
