import { type CreateSessionParams, getDefaultTransport, type Transport, type TransportRequest, type TransportResponse } from '@metamask/multichain-api-client';
import type { CaipAccountId } from '@metamask/utils';
import type { ExtendedTransport, RPCAPI, Scope, SessionData } from 'src/domain';
import { addValidAccounts, getOptionalScopes, getValidAccounts } from 'src/multichain/utils';

export class DefaultTransport implements ExtendedTransport {
	#requestId = 0;
	#transport: Transport = getDefaultTransport();

	async connect(options?: { scopes: Scope[]; caipAccountIds: CaipAccountId[] }): Promise<void> {
		await this.#transport.connect();
		//Get wallet session
		const sessionRequest = await this.request({ method: 'wallet_getSession' });
		let walletSession = sessionRequest.result as SessionData;
		if (walletSession && options) {
			const currentScopes = Object.keys(walletSession?.sessionScopes ?? {}) as Scope[];
			const proposedScopes = options?.scopes ?? [];
			const isSameScopes = currentScopes.every((scope) => proposedScopes.includes(scope)) && proposedScopes.every((scope) => currentScopes.includes(scope));
			if (!isSameScopes) {
				await this.request({ method: 'wallet_revokeSession', params: walletSession });
				const optionalScopes = addValidAccounts(getOptionalScopes(options?.scopes ?? []), getValidAccounts(options?.caipAccountIds ?? []));
				const sessionRequest: CreateSessionParams<RPCAPI> = { optionalScopes };
				const response = await this.request({ method: 'wallet_createSession', params: sessionRequest });
				walletSession = response.result as SessionData;
			}
		} else {
			const optionalScopes = addValidAccounts(getOptionalScopes(options?.scopes ?? []), getValidAccounts(options?.caipAccountIds ?? []));
			const sessionRequest: CreateSessionParams<RPCAPI> = { optionalScopes };
			await this.request({ method: 'wallet_createSession', params: sessionRequest });
		}
	}

	async disconnect(): Promise<void> {
		return this.#transport.disconnect();
	}

	isConnected() {
		return this.#transport.isConnected();
	}

	async request<TRequest extends TransportRequest, TResponse extends TransportResponse>(request: TRequest, options?: { timeout?: number }) {
		const requestWithId = {
			...request,
			jsonrpc: '2.0',
			id: `${this.#requestId++}`,
		};
		debugger;
		return this.#transport.request(requestWithId, options) as Promise<TResponse>;
	}

	onNotification(callback: (data: unknown) => void) {
		return this.#transport.onNotification(callback);
	}
}
