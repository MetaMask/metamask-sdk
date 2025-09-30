import { TransportTimeoutError, type Transport, type TransportRequest, type TransportResponse } from '@metamask/multichain-api-client';
import type { SessionRequest } from '@metamask/mobile-wallet-protocol-core';
import { SessionStore } from '@metamask/mobile-wallet-protocol-core';
import type { DappClient } from '@metamask/mobile-wallet-protocol-dapp-client';

import type { StoreAdapter } from 'src/domain';

const DEFAULT_REQUEST_TIMEOUT = 10000;

type PendingRequests = {
	resolve: (value: TransportResponse<unknown>) => void;
	reject: (error: Error) => void;
	timeout: NodeJS.Timeout;
};

/**
 * Mobile Wallet Protocol transport implementation
 * Bridges the MWP DappClient with the multichain API client Transport interface
 */
export class MWPTransport implements Transport {
	private __reqId = 0;
	private pendingRequests = new Map<string, PendingRequests>();
	private notificationCallbacks = new Set<(data: unknown) => void>();
	private currentSessionRequest: SessionRequest | undefined;

	private connectionPromise?: Promise<void>;

	get sessionRequest() {
		return this.currentSessionRequest;
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
			} else {
				this.notifyCallbacks(message);
			}
		}
	}

	constructor(
		private dappClient: DappClient,
		private kvstore: StoreAdapter,
		private options: Required<{ requestTimeout: number }> = { requestTimeout: DEFAULT_REQUEST_TIMEOUT },
	) {
		this.dappClient.on('message', this.handleMessage.bind(this));
	}

	/**
	 * Establishes a connection using the Mobile Wallet Protocol
	 * Note: This is a simplified implementation that expects the DappClient to be provided externally
	 */
	async connect(): Promise<void> {
		if (this.isConnected()) {
			return;
		}

		const { dappClient, kvstore } = this;
		const sessionStore = new SessionStore(kvstore);

		this.connectionPromise ??= new Promise<void>((resolve, reject) => {
			sessionStore
				.list()
				.then(([activeSession]) => {
					let connection: Promise<void>;
					if (activeSession) {
						connection = dappClient.resume(activeSession.id);
					} else {
						connection = dappClient.connect({ mode: 'trusted' });
					}
					connection.then(resolve).catch(reject);
				})
				.catch(reject);
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
			this.dappClient.sendRequest(request);
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
