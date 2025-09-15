import type { Transport, TransportResponse } from '@metamask/multichain-api-client';
import type { SessionRequest } from '@metamask/mobile-wallet-protocol-core';
import { SessionStore } from '@metamask/mobile-wallet-protocol-core';
import type { DappClient } from '@metamask/mobile-wallet-protocol-dapp-client';

import type { StoreAdapter } from 'src/domain';

const DEFAULT_REQUEST_TIMEOUT = 30000;

/**
 * Mobile Wallet Protocol transport implementation
 * Bridges the MWP DappClient with the multichain API client Transport interface
 */
export class MWPTransport implements Transport {
	private __reqId = 0;
	private pendingRequests = new Map<string, { resolve: (value: TransportResponse | PromiseLike<TransportResponse>) => void; reject: (error: Error) => void }>();
	private notificationCallbacks = new Set<(data: unknown) => void>();
	private currentSessionRequest: SessionRequest | undefined;

	get sessionRequest() {
		return this.currentSessionRequest;
	}

	constructor(
		private dappClient: DappClient,
		private kvstore: StoreAdapter,
		private options: Required<{ requestTimeout: number }> = { requestTimeout: DEFAULT_REQUEST_TIMEOUT },
	) {
		this.dappClient.on('message', (message: any) => {
			if ('id' in message && typeof message.id === 'string') {
				const request = this.pendingRequests.get(message.id);
				if (request) {
					request.resolve(message);
					this.pendingRequests.delete(message.id);
				}
			} else {
				this.notify(message);
			}
		});
	}

	private notify(data: unknown): void {
		this.notificationCallbacks.forEach((callback) => callback(data));
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
		const [activeSession] = (await sessionStore.list()) ?? [];
		if (activeSession) {
			return dappClient.resume(activeSession.id);
		} else {
			return dappClient.connect({
				mode: 'trusted',
			});
		}
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
		//required if state is not made public in dappClient
		return (this.dappClient as any).state === 'CONNECTED';
	}

	/**
	 * Sends a request through the Mobile Wallet Protocol
	 */
	async request(payload: any): Promise<any> {
		const response = await new Promise((resolve, reject) => {
			const request = {
				id: `${this.__reqId++}`,
				jsonrpc: '2.0',
				...payload,
			};
			this.pendingRequests.set(request.id, { resolve, reject });
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
