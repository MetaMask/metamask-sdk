import { CommunicationLayerPreference } from '@metamask/sdk-communication-layer';
import { ProviderConstants } from '../constants';
import { RemoteConnection } from '../services/RemoteConnection';
import { PostMessageStream } from './PostMessageStream';
import { RemoteCommunicationPostMessageStream } from './RemoteCommunicationPostMessageStream';

export interface GetPostMessageStreamProps {
  name: ProviderConstants;
  target: ProviderConstants;
  remoteConnection?: RemoteConnection;
  communicationLayerPreference: CommunicationLayerPreference;
  debug: boolean;
}

export const getPostMessageStream = ({
  name,
  remoteConnection,
  debug,
}: GetPostMessageStreamProps): PostMessageStream => {
  if (!remoteConnection || !remoteConnection?.getConnector()) {
    throw new Error(`Missing remote conenction parameter`);
  }

  return new RemoteCommunicationPostMessageStream({
    name,
    remote: remoteConnection?.getConnector(),
    debug,
  });
};
