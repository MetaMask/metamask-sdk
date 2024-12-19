import type { JsonRpcMiddleware } from '@metamask/json-rpc-engine';
import type { Json, JsonRpcParams } from '@metamask/utils';
import type { ConsoleLike } from '../utils';
/**
 * Create JSON-RPC middleware that logs warnings for deprecated RPC methods.
 *
 * @param log - The logging API to use.
 * @returns The JSON-RPC middleware.
 */
export declare function createRpcWarningMiddleware(log: ConsoleLike): JsonRpcMiddleware<JsonRpcParams, Json>;
//# sourceMappingURL=createRpcWarningMiddleware.d.ts.map