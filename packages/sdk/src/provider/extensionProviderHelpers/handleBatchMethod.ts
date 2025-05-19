import { MetaMaskInpageProvider } from '@metamask/providers';
import {
  TrackingEvents,
  IGNORE_ANALYTICS_RPCS,
} from '@metamask/sdk-communication-layer';
import { MetaMaskSDK } from '../../sdk';
import { RequestArguments } from '../wrapExtensionProvider';
import { getPlatformDetails } from './handleUuid';
import { trackRpcOutcome } from './analyticsHelper';

export const handleBatchMethod = async ({
  target,
  args,
  trackEvent,
  sdkInstance,
}: {
  target: MetaMaskInpageProvider;
  args: RequestArguments;
  trackEvent: boolean;
  sdkInstance: MetaMaskSDK;
}) => {
  if (args.method !== 'metamask_batch') {
    throw new Error('Invalid usage');
  }

  // params is a list of RPCs to call
  const responses = [];
  const params = args?.params ?? [];
  for (const rpc of params) {
    const response = await target?.request({
      method: rpc.method,
      params: rpc.params,
    });
    responses.push(response);
  }

  const { id, from } = getPlatformDetails(sdkInstance);

  if (trackEvent) {
    sdkInstance.analytics?.send({
      event: TrackingEvents.SDK_RPC_REQUEST_DONE,
      params: {
        method: args.method,
        from,
        id,
      },
    });
  }

  for (const individualResp of responses) {
    trackRpcOutcome(args.method, individualResp, null);
  }

  return responses;
};
