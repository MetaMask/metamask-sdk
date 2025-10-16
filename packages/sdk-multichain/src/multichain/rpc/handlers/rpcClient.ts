import type { Json } from '@metamask/utils';
import fetch from 'cross-fetch';
import {
	getInfuraRpcUrls,
	type InvokeMethodOptions,
	type MultichainOptions,
	RPCHttpErr,
	RPCReadonlyRequestErr,
	RPCReadonlyResponseErr,
	RPCResponse,
	RpcUrlsMap,
	Scope,
} from '../../../domain';

let rpcId = 1;

export function getNextRpcId() {
	rpcId += 1;
	return rpcId;
}

export class MissingRpcEndpointErr extends Error { };

export class RpcClient {
	constructor(
		private readonly config: MultichainOptions,
		private readonly sdkInfo: string,
	) {}

	/**
	 * Routes the request to a configured RPC node.
	 */
	async request(options: InvokeMethodOptions): Promise<Json> {
		const { request } = options;
		const body = JSON.stringify({
			jsonrpc: '2.0',
			method: request.method,
			params: request.params,
			id: getNextRpcId(),
		});
		const rpcEndpoint = this.getRpcEndpoint(options.scope);
		const rpcRequest = await this.fetch(rpcEndpoint, body, 'POST', this.getHeaders(rpcEndpoint));
		const response = await this.parseResponse(rpcRequest);
		return response;
	}

	private getRpcEndpoint(scope: Scope) {
		let infuraAPIKey = this.config?.api?.infuraAPIKey;

		let readonlyRPCMap: RpcUrlsMap = this.config?.api?.readonlyRPCMap ?? {};
		if (infuraAPIKey) {
			const urlsWithToken = getInfuraRpcUrls(infuraAPIKey);
			if (readonlyRPCMap) {
				readonlyRPCMap = {
					...urlsWithToken,
					...readonlyRPCMap,
				};
			} else {
				readonlyRPCMap = urlsWithToken;
			}
		}
		const rpcEndpoint = readonlyRPCMap[scope];
		if (!rpcEndpoint) {
			throw new MissingRpcEndpointErr(`No RPC endpoint found for scope ${scope}`);
		}
		return rpcEndpoint;
	}

	private async fetch(endpoint: string, body: string, method: string, headers: Record<string, string>) {
		try {
			const response = await fetch(endpoint, {
				method,
				headers,
				body,
			});
			if (!response.ok) {
				throw new RPCHttpErr(endpoint, method, response.status);
			}
			return response;
		} catch (error) {
			if (error instanceof RPCHttpErr) {
				throw error;
			}
			throw new RPCReadonlyRequestErr(error.message);
		}
	}

	private async parseResponse(response: Response) {
		try {
			const rpcResponse = (await response.json()) as RPCResponse;
			return rpcResponse.result as Json;
		} catch (error) {
			throw new RPCReadonlyResponseErr(error.message);
		}
	}

	private getHeaders(rpcEndpoint: string) {
		const defaultHeaders = {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		};
		if (rpcEndpoint.includes('infura')) {
			return {
				...defaultHeaders,
				'Metamask-Sdk-Info': this.sdkInfo,
			};
		}
		return defaultHeaders;
	}
}
