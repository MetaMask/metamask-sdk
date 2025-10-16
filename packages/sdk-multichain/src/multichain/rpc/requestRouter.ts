import type { Json } from '@metamask/utils';
import { METAMASK_CONNECT_BASE_URL, METAMASK_DEEPLINK_BASE } from '../../config';
import { type ExtendedTransport, type InvokeMethodOptions, isSecure, type MultichainOptions, RPC_HANDLED_METHODS, RPCInvokeMethodErr, SDK_HANDLED_METHODS } from '../../domain';

import { openDeeplink } from '../utils';
import { MissingRpcEndpointErr, RpcClient } from './handlers/rpcClient';

let rpcId = 1;

export function getNextRpcId() {
	rpcId += 1;
	return rpcId;
}

export class RequestRouter {
	constructor(
		private readonly transport: ExtendedTransport,
		private readonly rpcClient: RpcClient,
		private readonly config: MultichainOptions,
	) {}

	/**
	 * The main entry point for invoking an RPC method.
	 * This method acts as a router, determining the correct handling strategy
	 * for the request and delegating to the appropriate private handler.
	 */
	async invokeMethod(options: InvokeMethodOptions): Promise<Json> {
		const method = options.request.method;
		if (RPC_HANDLED_METHODS.has(method)) {
			return this.handleWithRpcNode(options);
		}
		if (SDK_HANDLED_METHODS.has(method)) {
			return this.handleWithSdkState(options);
		}
		return this.handleWithWallet(options);
	}

	/**
	 * Forwards the request directly to the wallet via the transport.
	 */
	private async handleWithWallet(options: InvokeMethodOptions): Promise<Json> {
		try {
			const request = this.transport.request({
				method: 'wallet_invokeMethod',
				params: options,
			});

			const { ui, mobile } = this.config;
			const { preferDesktop = false } = ui ?? {};
			const secure = isSecure();
			const shouldOpenDeeplink = secure && !preferDesktop;

			if (shouldOpenDeeplink) {
				setTimeout(() => {
					if (mobile?.preferredOpenLink) {
						mobile.preferredOpenLink(METAMASK_DEEPLINK_BASE, '_self');
					} else {
						openDeeplink(this.config, METAMASK_DEEPLINK_BASE, METAMASK_CONNECT_BASE_URL);
					}
				}, 10); // small delay to ensure the message encryption and dispatch completes
			}

			const response = await request;
			if (response.error) {
				throw new RPCInvokeMethodErr(`RPC Request failed with code ${response.error.code}: ${response.error.message}`);
			}
			return response.result as Json;
		} catch (error) {
			throw new RPCInvokeMethodErr(error.message);
		}
	}

	/**
	 * Routes the request to a configured RPC node.
	 */
	private async handleWithRpcNode(options: InvokeMethodOptions): Promise<Json> {
		try {
			return await this.rpcClient.request(options);
		} catch (error) {
			if (error instanceof MissingRpcEndpointErr) {
				return this.handleWithWallet(options);
			}
			throw error;
		}
	}

	/**
	 * Responds directly from the SDK's session state.
	 */
	private async handleWithSdkState(options: InvokeMethodOptions): Promise<Json> {
		// TODO: to be implemented
		console.warn(`Method "${options.request.method}" is configured for SDK state handling, but this is not yet implemented. Falling back to wallet passthrough.`);
		return this.handleWithWallet(options);
	}
}
