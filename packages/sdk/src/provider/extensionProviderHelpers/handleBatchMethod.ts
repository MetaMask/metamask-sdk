import { MetaMaskInpageProvider } from '@metamask/providers';
import {
  TrackingEvents,
  PlatformType,
} from '@metamask/sdk-communication-layer';
import { MetaMaskSDK } from '../../sdk';
import { RequestArguments } from '../wrapExtensionProvider';
import { getOrCreateUuidForIdentifier } from './handleUuid';

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

  const { dappMetadata } = sdkInstance;
  const url = dappMetadata?.url ?? 'no_url';
  const name = dappMetadata?.name ?? 'no_name';
  const id = getOrCreateUuidForIdentifier(url, name);

  const platFormType = sdkInstance.platformManager?.getPlatformType();
  const isExtension = Boolean(platFormType === PlatformType.DesktopWeb);
  const isInAppBrowser = Boolean(
    platFormType === PlatformType.MetaMaskMobileWebview,
  );

  let from = 'N/A';
  if (isExtension) {
    from = 'extension';
  } else if (isInAppBrowser) {
    from = 'mobile';
  }

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
  return resp;
};
