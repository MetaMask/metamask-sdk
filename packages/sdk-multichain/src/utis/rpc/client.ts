import type { Json } from '@metamask/utils';
import fetch from 'cross-fetch';
import type { InvokeMethodParams, MultichainApiClient } from '@metamask/multichain-api-client';

import {
	type InvokeMethodOptions,
	type MultichainSDKConstructor,
	type RPC_URLS_MAP,
	type RPCAPI,
	type RPCResponse,
	type Scope,
	METHODS_TO_REDIRECT,
	RPCReadonlyResponseErr,
	RPCHttpErr,
	RPCReadonlyRequestErr,
	RPCInvokeMethodErr,
	getInfuraRpcUrls,
} from '../../domain';

let rpcId = 1;

export function getNextRpcId() {
	rpcId += 1;
	return rpcId;
}

export class RPCClient {
	constructor(
		private readonly provider: MultichainApiClient<RPCAPI>,
		private readonly config: MultichainSDKConstructor['api'],
		private readonly sdkInfo: string,
	) {}

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

	private async runReadOnlyMethod(options: InvokeMethodOptions, rpcEndpoint: string) {
		const { request } = options;
		const body = JSON.stringify({
			jsonrpc: '2.0',
			method: request.method,
			params: request.params,
			id: getNextRpcId(),
		});
		const rpcRequest = await this.fetch(rpcEndpoint, body, 'POST', this.getHeaders(rpcEndpoint));
		const response = await this.parseResponse(rpcRequest);
		return response;
	}

	async invokeMethod(options: InvokeMethodOptions) {
		const { request } = options;
		const { config } = this;
		const { infuraAPIKey, readonlyRPCMap: readonlyRPCMapConfig } = config ?? {};
		let readonlyRPCMap: RPC_URLS_MAP = {};
		if (infuraAPIKey) {
			const urlsWithToken = getInfuraRpcUrls(infuraAPIKey);
			if (readonlyRPCMapConfig) {
				readonlyRPCMap = {
					...readonlyRPCMapConfig,
					...urlsWithToken,
				};
			} else {
				readonlyRPCMap = urlsWithToken;
			}
		} else {
			readonlyRPCMap = readonlyRPCMapConfig ?? {};
		}
		const rpcEndpoint = readonlyRPCMap[options.scope];
		const isReadOnlyMethod = !METHODS_TO_REDIRECT[request.method];
		if (rpcEndpoint && isReadOnlyMethod) {
			const response = await this.runReadOnlyMethod(options, rpcEndpoint);
			return response;
		}
		try {
			const response = await this.provider.invokeMethod(options as InvokeMethodParams<RPCAPI, Scope, never>);
			return response;
		} catch (error) {
			throw new RPCInvokeMethodErr(error.message);
		}
	}
}
