import { type CreateSessionParams, TransportTimeoutError, type TransportRequest, type TransportResponse } from '@metamask/multichain-api-client';
import type { Session, SessionRequest } from '@metamask/mobile-wallet-protocol-core';
import { SessionStore } from '@metamask/mobile-wallet-protocol-core';
import type { DappClient } from '@metamask/mobile-wallet-protocol-dapp-client';

import type { ExtendedTransport, RPCAPI, Scope, SessionData, StoreAdapter } from '../../../domain';
import type { CaipAccountId } from '@metamask/utils';
import { addValidAccounts, getOptionalScopes, getValidAccounts } from '../../utils';

const DEFAULT_REQUEST_TIMEOUT = 30000;
const DEFAULT_CONNECTION_TIMEOUT = 30000;

type PendingRequests = {
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
			window.addEventListener('focus', () => {
				if (!this.isConnected()) {
					this.dappClient.reconnect();
				}
			});
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
		if (typeof message === 'object' && message !== null && 'data' in message) {
			const messagePayload = message.data as Record<string, unknown>;
			if ('id' in messagePayload && typeof messagePayload.id === 'string') {
				const request = this.pendingRequests.get(messagePayload.id);
				if (request) {
					clearTimeout(request.timeout);
					request.resolve(messagePayload as TransportResponse<unknown>);
					this.pendingRequests.delete(messagePayload.id);
					return;
				}
			}
			this.notifyCallbacks(message);
		}
	}

	/**
	 * Establishes a connection using the Mobile Wallet Protocol
	 * Note: This is a simplified implementation that expects the DappClient to be provided externally
	 */
	async connect(options?: { scopes: Scope[]; caipAccountIds: CaipAccountId[] }): Promise<void> {
		if (this.isConnected()) {
			return;
		}

		const { dappClient, kvstore } = this;
		const sessionStore = new SessionStore(kvstore);

		let session: Session | undefined;
		try {
			const [activeSession] = await sessionStore.list();
			if (activeSession) {
				session = activeSession;
			}
		} catch {}

		this.connectionPromise ??= new Promise<void>((resolve, reject) => {
			let connection: Promise<void>;
			let unsubscribe: () => void;
			if (session) {
				connection = dappClient.resume(session.id);
			} else {
				if (options) {
					const optionalScopes = addValidAccounts(getOptionalScopes(options.scopes ?? []), getValidAccounts(options.caipAccountIds ?? []));
					const sessionRequest: CreateSessionParams<RPCAPI> = { optionalScopes };
					const request = { id: `${this.__reqId++}`, jsonrpc: '2.0', method: 'wallet_createSession', params: sessionRequest };

					this.dappClient.once('message', (payload) => {
						if (typeof payload === 'object' && payload !== null && 'data' in payload) {
							const data = payload.data as Record<string, unknown>;
							if ('method' in data && data.method === 'wallet_createSession') {
								//TODO: is it .params or .result?
								const session = (data.params || data.result) as SessionData;
								if (session) {
									this.notifyCallbacks(payload);
									// Initial request will be what resolves the connection when options is specified
									resolve();
								}
							}
						}
					});

					unsubscribe = this.onNotification((payload) => {
						if (typeof payload === 'object' && payload !== null && 'data' in payload) {
							const data = payload.data as Record<string, unknown>;
							if ('method' in data && data.method === 'wallet_createSession') {
								//TODO: is it .params or .result?
								const session = (data.params || data.result) as SessionData;
								if (session) {
									// Initial request will be what resolves the connection when options is specified
									resolve();
								}
							}
						}
					});
					connection = dappClient.connect({ mode: 'trusted', initialPayload: request });
				} else {
					connection = dappClient.connect({ mode: 'trusted' });
				}
			}
			connection
				.then(() => {
					// Resolve connection only if we did not also request an initial request
					if (!options) {
						resolve();
					}
				})
				.catch(reject)
				.finally(() => {
					unsubscribe?.();
				});
		});

		return this.connectionPromise.finally(() => {
			this.connectionPromise = undefined;
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
	async request<TRequest extends TransportRequest, TResponse extends TransportResponse>(payload: TRequest): Promise<TResponse> {
		const response = await new Promise<TResponse>((resolve, reject) => {
			const request = {
				id: `${this.__reqId++}`,
				jsonrpc: '2.0',
				...payload,
			};
			const timeout = setTimeout(() => {
				this.rejectRequest(request.id, new TransportTimeoutError());
			}, this.options.requestTimeout);

			this.pendingRequests.set(request.id, { resolve: resolve as (value: TransportResponse<unknown>) => void, reject, timeout });
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
