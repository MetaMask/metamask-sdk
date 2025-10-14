import type { Json } from '@metamask/utils';
import fetch from 'cross-fetch';

import {
	type ExtendedTransport,
	getInfuraRpcUrls,
	type InvokeMethodOptions,
	isSecure,
	type MultichainOptions,
	type RpcUrlsMap,
	RPCHttpErr,
	RPCInvokeMethodErr,
	RPCReadonlyRequestErr,
	RPCReadonlyResponseErr,
	type RPCResponse,
	EVM_RPC_PASSTHROUGH_METHODS,
} from '../../domain';
import { METAMASK_CONNECT_BASE_URL, METAMASK_DEEPLINK_BASE } from 'src/config';
import { openDeeplink } from '../utils';

let rpcId = 1;

export function getNextRpcId() {
	rpcId += 1;
	return rpcId;
}

export class RPCClient {
	constructor(
		private readonly transport: ExtendedTransport,
		private readonly config: MultichainOptions,
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

	private async requestFromRpcEndpoint(options: InvokeMethodOptions, rpcEndpoint: string) {
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
		const { config } = this;
		const { request } = options;
		const { api, ui, mobile } = config;

		const { preferDesktop = false, headless: _headless = false } = ui ?? {};
		const { infuraAPIKey, readonlyRPCMap: readonlyRPCMapConfig } = api ?? {};

		let readonlyRPCMap: RpcUrlsMap = readonlyRPCMapConfig ?? {};
		if (infuraAPIKey) {
			const urlsWithToken = getInfuraRpcUrls(infuraAPIKey);
			if (readonlyRPCMapConfig) {
				readonlyRPCMap = {
					...urlsWithToken,
					...readonlyRPCMapConfig,
				};
			} else {
				readonlyRPCMap = urlsWithToken;
			}
		}
		const rpcEndpoint = readonlyRPCMap[options.scope];
		const isPassthroughMethod = EVM_RPC_PASSTHROUGH_METHODS.find((method) => method === request.method);
		if (rpcEndpoint && isPassthroughMethod) {
			const response = await this.requestFromRpcEndpoint(options, rpcEndpoint);
			return response;
		}
		try {
			const request = this.transport.request({
				method: 'wallet_invokeMethod',
				params: options,
			});

			const secure = isSecure();
			const shouldOpenDeeplink = secure && !preferDesktop;

			if (shouldOpenDeeplink) {
				setTimeout(() => {
					if (mobile?.preferredOpenLink) {
						mobile.preferredOpenLink(METAMASK_DEEPLINK_BASE, '_self');
					} else {
						openDeeplink(this.config, METAMASK_DEEPLINK_BASE, METAMASK_CONNECT_BASE_URL);
					}
				}, 250);
			}

			const response = await request;
			if (response.error) {
				throw new RPCInvokeMethodErr(`RPC Request failed with code ${response.error.code}: ${response.error.message}`);
			}
			return response.result;
		} catch (error) {
			throw new RPCInvokeMethodErr(error.message);
		}
	}
}
