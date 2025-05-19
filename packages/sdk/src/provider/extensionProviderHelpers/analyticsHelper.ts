import { analytics } from '@metamask/sdk-analytics';
import { isAnalyticsTrackedRpcMethod } from '@metamask/sdk-communication-layer';

/**
 * Tracks the outcome of an RPC method for analytics.
 *
 * @param method - The RPC method name.
 * @param resp - The response object from the RPC call.
 * @param caughtError - Any error caught during the RPC call.
 */
export const trackRpcOutcome = (
  method: string,
  resp: any,
  caughtError: any,
): void => {
  if (isAnalyticsTrackedRpcMethod(method)) {
    const responseIndicatesError =
      resp && typeof resp === 'object' && resp !== null && 'error' in resp;

    if (caughtError || responseIndicatesError) {
      // Determine if it's a user rejection (EIP-1193 specific code)
      const errorObj = caughtError || (resp as any)?.error;
      if (errorObj && errorObj.code === 4001) {
        analytics.track('sdk_action_rejected', { action: method });
      } else {
        analytics.track('sdk_action_failed', { action: method });
      }
    } else {
      analytics.track('sdk_action_succeeded', { action: method });
    }
  }
};
