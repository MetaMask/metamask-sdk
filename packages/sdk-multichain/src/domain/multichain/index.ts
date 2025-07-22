import type { CaipAccountId, Json } from "@metamask/utils";
import type { StoreClient } from "../store/client";
import type { InvokeMethodOptions, RPCAPI, Scope } from "./api/types";
import { EventEmitter, type SDKEvents } from "../events";
import type { MultichainOptions } from "./types";
import type { MultichainApiClient, Transport } from "@metamask/multichain-api-client";

export type SDKState = "pending" | "loaded" | "disconnected" | "connected";

export enum TransportType {
	Browser = "browser",
	MPW = "mwp",
	UNKNOWN = "unknown",
}

/**
 * Abstract base class for the Multichain SDK implementation.
 *
 * This class defines the core interface that all Multichain SDK implementations
 * must provide, including session management, connection handling, and method invocation.
 */
export abstract class MultichainCore extends EventEmitter<SDKEvents> {
	abstract storage: StoreClient;
	abstract state: SDKState;
	abstract provider: MultichainApiClient<RPCAPI>;
	abstract transport: Transport;

	abstract init(): Promise<void>;
	/**
	 * Establishes a connection to the multichain provider, or re-use existing session
	 *
	 * @returns Promise that resolves to the session data
	 */
	abstract connect(scopes: Scope[], caipAccountIds: CaipAccountId[]): Promise<void>;
	/**
	 * Disconnects from the multichain provider.
	 *
	 * @returns Promise that resolves when disconnection is complete
	 */
	abstract disconnect(): Promise<void>;
	/**
	 * Invokes an RPC method with the specified options.
	 *
	 * @param options - The method invocation options including scope and request details
	 * @returns Promise that resolves to the method result
	 */
	abstract invokeMethod(options: InvokeMethodOptions): Promise<Json>;

	constructor(protected readonly options: MultichainOptions) {
		super();
	}
}
/* c8 ignore end */

export function getTransportType(type: string): TransportType {
	switch (type) {
		case "browser":
			return TransportType.Browser;
		case "mwp":
			return TransportType.MPW;
		default:
			return TransportType.UNKNOWN;
	}
}

export type * from "./api/types";
export type * from "./types";
export * from "./api/constants";
export * from "./api/infura";
