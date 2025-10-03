import { type CreateSessionParams, getDefaultTransport, type Transport, type TransportRequest, type TransportResponse } from '@metamask/multichain-api-client';
import type { CaipAccountId } from '@metamask/utils';
import { createLogger, type ExtendedTransport, type RPCAPI, type Scope, type SessionData } from 'src/domain';
import { addValidAccounts, getOptionalScopes, getValidAccounts } from 'src/multichain/utils';
const logger = createLogger('metamask-sdk:transport');

const DEFAULT_REQUEST_TIMEOUT = 60 * 1000;

export class DefaultTransport implements ExtendedTransport {
	#notificationCallbacks: Set<(data: unknown) => void> = new Set();
	#transport: Transport = getDefaultTransport();
	#defaultRequestOptions = {
		timeout: DEFAULT_REQUEST_TIMEOUT,
	};

	#notifyCallbacks(data: unknown) {
		logger('notifyCallbacks', data);
		for (const cb of this.#notificationCallbacks) {
			try {
				cb(data);
			} catch (err) {
				console.log('[WindowPostMessageTransport] notifyCallbacks error:', err);
			}
		}
	}

	async connect(options?: { scopes: Scope[]; caipAccountIds: CaipAccountId[] }): Promise<void> {
		logger('connecting...', options);
		await this.#transport.connect();

		//Get wallet session
		const sessionRequest = await this.request({ method: 'wallet_getSession' }, this.#defaultRequestOptions);
		if (sessionRequest.error) {
			throw new Error(sessionRequest.error.message);
		}
		let walletSession = sessionRequest.result as SessionData;
		logger('current wallet session', walletSession);
		if (walletSession && options) {
			const currentScopes = Object.keys(walletSession?.sessionScopes ?? {}) as Scope[];
			const proposedScopes = options?.scopes ?? [];
			const isSameScopes = currentScopes.every((scope) => proposedScopes.includes(scope)) && proposedScopes.every((scope) => currentScopes.includes(scope));
			logger('isSameScopes', isSameScopes);
			if (!isSameScopes) {
				logger('scopes are different, revoking session and creating a new one');
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
			logger('no session found, creating a new one');
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
		logger('connected');
	}

	async disconnect(): Promise<void> {
		logger('disconnecting...');
		this.#notificationCallbacks.clear();
		return this.#transport.disconnect();
	}

	isConnected() {
		return this.#transport.isConnected();
	}

	async request<TRequest extends TransportRequest, TResponse extends TransportResponse>(request: TRequest, options: { timeout?: number } = this.#defaultRequestOptions) {
		logger('request', request);
		return this.#transport.request(request, options) as Promise<TResponse>;
	}

	onNotification(callback: (data: unknown) => void) {
		logger('onNotification registered');
		this.#transport.onNotification(callback);
		this.#notificationCallbacks.add(callback);
		return () => {
			logger('onNotification unregistered');
			this.#notificationCallbacks.delete(callback);
		};
	}
}
