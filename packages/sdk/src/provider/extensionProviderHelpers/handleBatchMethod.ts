import { MetaMaskInpageProvider } from '@metamask/providers';
import { TrackingEvents } from '@metamask/sdk-communication-layer';
import { MetaMaskSDK } from '../../sdk';
import { RequestArguments } from '../wrapExtensionProvider';
import { getPlatformDetails } from './handleUuid';

export const handleBatchMethod = async ({
  params,
  args,
  trackEvent,
  provider,
  sdkInstance,
}: {
  params: any[];
  args: RequestArguments;
  trackEvent: boolean;
  provider: MetaMaskInpageProvider;
  sdkInstance: MetaMaskSDK;
}) => {
  // params is a list of RPCs to call
  const responses = [];
  for (const rpc of params) {
    const response = await provider?.request({
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
  return responses;
};
