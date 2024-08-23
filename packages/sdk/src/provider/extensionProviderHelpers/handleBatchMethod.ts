import { MetaMaskInpageProvider } from '@metamask/providers';
import { TrackingEvents } from '@metamask/sdk-communication-layer';
import { MetaMaskSDK } from '../../sdk';
import { RequestArguments } from '../wrapExtensionProvider';

export const handleBatchMethod = async ({
  params,
  target,
  args,
  trackEvent,
  provider,
  sdkInstance,
}: {
  params: any[];
  target: MetaMaskInpageProvider;
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

  const resp = await target.request(args);
  const selectedAddress = provider.selectedAddress || {};

  if (trackEvent) {
    sdkInstance.analytics?.send({
      event: TrackingEvents.SDK_RPC_REQUEST_DONE,
      params: { method: args.method, from: 'extension', id: selectedAddress },
    });
  }
  return resp;
};
