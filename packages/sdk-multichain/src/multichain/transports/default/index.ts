import { type CreateSessionParams, getDefaultTransport, type Transport, type TransportRequest, type TransportResponse } from '@metamask/multichain-api-client';
import type { CaipAccountId } from '@metamask/utils';
import type { ExtendedTransport, RPCAPI, Scope, SessionData } from 'src/domain';
import { addValidAccounts, getOptionalScopes, getValidAccounts, isSameScopesAndAccounts } from 'src/multichain/utils';

const DEFAULT_REQUEST_TIMEOUT = 60 * 1000;

export class DefaultTransport implements ExtendedTransport {
	#notificationCallbacks: Set<(data: unknown) => void> = new Set();
	#transport: Transport = getDefaultTransport();
	#defaultRequestOptions = {
		timeout: DEFAULT_REQUEST_TIMEOUT,
	};

	#notifyCallbacks(data: unknown) {
		for (const cb of this.#notificationCallbacks) {
			try {
				cb(data);
			} catch (err) {
				console.log('[WindowPostMessageTransport] notifyCallbacks error:', err);
			}
		}
	}

	async connect(options?: { scopes: Scope[]; caipAccountIds: CaipAccountId[] }): Promise<void> {
		await this.#transport.connect();

		//Get wallet session
		const sessionRequest = await this.request({ method: 'wallet_getSession' }, this.#defaultRequestOptions);
		if (sessionRequest.error) {
			throw new Error(sessionRequest.error.message);
		}
		let walletSession = sessionRequest.result as SessionData;
		if (walletSession && options) {
			const currentScopes = Object.keys(walletSession?.sessionScopes ?? {}) as Scope[];
			const proposedScopes = options?.scopes ?? [];
			const proposedCaipAccountIds = options?.caipAccountIds ?? [];
			const hasSameScopesAndAccounts = isSameScopesAndAccounts(currentScopes, proposedScopes, walletSession, proposedCaipAccountIds);
			if (!hasSameScopesAndAccounts) {
				await this.request({ method: 'wallet_revokeSession', params: walletSession }, this.#defaultRequestOptions);
				const optionalScopes = addValidAccounts(getOptionalScopes(options?.scopes ?? []), getValidAccounts(options?.caipAccountIds ?? []));
				const sessionRequest: CreateSessionParams<RPCAPI> = { optionalScopes };
				const response = await this.request({ method: 'wallet_createSession', params: sessionRequest }, this.#defaultRequestOptions);
				if (response.error) {
					throw new Error(response.error.message);
				}
				walletSession = response.result as SessionData;
			}
		} else if (!walletSession) {
			const optionalScopes = addValidAccounts(getOptionalScopes(options?.scopes ?? []), getValidAccounts(options?.caipAccountIds ?? []));
			const sessionRequest: CreateSessionParams<RPCAPI> = { optionalScopes };
			const response = await this.request({ method: 'wallet_createSession', params: sessionRequest }, this.#defaultRequestOptions);
			if (response.error) {
				throw new Error(response.error.message);
			}
			walletSession = response.result as SessionData;
		}
		this.#notifyCallbacks({
			method: 'wallet_sessionChanged',
			params: walletSession,
		});
	}

	async disconnect(): Promise<void> {
		this.#notificationCallbacks.clear();
		return this.#transport.disconnect();
	}

	isConnected() {
		return this.#transport.isConnected();
	}

	async request<TRequest extends TransportRequest, TResponse extends TransportResponse>(request: TRequest, options: { timeout?: number } = this.#defaultRequestOptions) {
		return this.#transport.request(request, options) as Promise<TResponse>;
	}

	onNotification(callback: (data: unknown) => void) {
		this.#transport.onNotification(callback);
		this.#notificationCallbacks.add(callback);
		return () => {
			this.#notificationCallbacks.delete(callback);
		};
	}
}
