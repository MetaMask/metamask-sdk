import { CommunicationLayerPreference } from '@metamask/sdk-communication-layer';
import { PlatformManager } from '../Platform/PlatfformManager';
import { ProviderConstants } from '../constants';
import { RemoteConnection } from '../services/RemoteConnection';
import { PostMessageStream } from './PostMessageStream';
import { RemoteCommunicationPostMessageStream } from './RemoteCommunicationPostMessageStream';

export interface GetPostMessageStreamProps {
  name: ProviderConstants;
  target: ProviderConstants;
  remoteConnection?: RemoteConnection;
  platformManager: PlatformManager;
  communicationLayerPreference: CommunicationLayerPreference;
}

export const getPostMessageStream = ({
  name,
  remoteConnection,
}: GetPostMessageStreamProps): PostMessageStream => {
  if (!remoteConnection || !remoteConnection?.getConnector()) {
    throw new Error(`Missing remote connection parameter`);
  }

  return new RemoteCommunicationPostMessageStream({
    name,
    remote: remoteConnection?.getConnector(),
    deeplinkProtocol: remoteConnection?.state.deeplinkProtocol,
    hideReturnToAppNotification: remoteConnection?.state.hideReturnToAppNotification,
    platformManager: remoteConnection?.getPlatformManager(),
  });
};
