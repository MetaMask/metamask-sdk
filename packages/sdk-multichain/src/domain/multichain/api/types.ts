import { Json } from "@metamask/utils";
import type EIP155 from "./eip155";

/**
 * Represents a blockchain scope identifier in CAIP format.
 *
 * Scopes define which blockchain networks and standards the SDK
 * can interact with. The format follows CAIP standards for
 * blockchain identification.
 *
 * @template T - The RPC API type to extract available scopes from
 */
export type Scope<T extends RPCAPI = RPCAPI> =
  | `eip155:${string}`
  | `solana:${string}`
  | `${Extract<keyof T, string>}:${string}`;

/**
 * Represents a generic RPC (Remote Procedure Call) method function type.
 *
 * This type defines the signature for RPC methods that can be either synchronous
 * or asynchronous, providing flexibility for different types of API calls.
 *
 * @template Params - The type of parameters that the RPC method accepts
 * @template Return - The type of value that the RPC method returns
 *
 * @param params - The parameters to pass to the RPC method
 * @returns Either a Promise that resolves to the return value, or the return value directly
 */
export type RpcMethod<Params, Return> = (params: Params) => Promise<Return> | Return;

/**
 * Defines the structure of the RPC API interface.
 *
 * This type represents the available RPC APIs organized by blockchain standard.
 * Currently supports EIP-155 (Ethereum) with the potential for additional
 * blockchain standards to be added in the future.
 */
export type RPCAPI = {
  /** EIP-155 compliant RPC methods for Ethereum-based chains */
  eip155: EIP155;
};

/**
 * Represents a notification object for RPC communication.
 *
 * Notifications are one-way messages sent from the server to the client
 * that don't require a response. They follow the JSON-RPC 2.0 specification
 * for notification messages.
 */
export type Notification = {
  /** The name of the method being called */
  method: string;
  /** Optional parameters for the method call */
  params?: Json;
  /** JSON-RPC version identifier (typically "2.0") */
  jsonrpc?: string;
};

/**
 * Callback function type for handling incoming notifications.
 *
 * This type defines the signature for functions that process notification
 * messages received from RPC connections.
 *
 * @param notification - The notification object to handle
 */
export type NotificationCallback = (notification: Notification) => void;

/**
 * Options for invoking RPC methods with specific scope and request parameters.
 *
 * This type defines the structure for method invocation options, allowing
 * callers to specify both the blockchain scope and the specific request details.
 */
export type InvokeMethodOptions = {
  /** The blockchain scope/standard to use for the method call */
  scope: Scope;
  /** The request details including method name and parameters */
  request: {
    /** The name of the RPC method to invoke */
    method: string;
    /** The parameters to pass to the RPC method */
    params: unknown;
  };
};


/**
 * Mapping of CAIP chain IDs to their corresponding RPC URLs.
 *
 * This type defines the structure for providing custom RPC endpoints
 * for different blockchain networks using CAIP-2 format identifiers.
 */
export type RPC_URLS_MAP = {
  /** CAIP-2 format chain ID mapped to its RPC URL (e.g., "eip155:1" -> "https://...") */
  [chainId: `${string}:${string}`]: string;
};


