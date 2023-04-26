import { CommunicationLayerPreference } from '@metamask/sdk-communication-layer';
import { ProviderConstants } from '../constants';
import { RemoteConnection } from '../services/RemoteConnection';
import { WalletConnect } from '../services/WalletConnect';
import { PostMessageStream } from './PostMessageStream';
import { RemoteCommunicationPostMessageStream } from './RemoteCommunicationPostMessageStream';
import { WalletConnectPostMessageStream } from './WalletConnectPostMessageStream';

export interface GetPostMessageStreamProps {
  name: ProviderConstants;
  target: ProviderConstants;
  remoteConnection?: RemoteConnection;
  walletConnect?: WalletConnect;
  communicationLayerPreference: CommunicationLayerPreference;
  debug: boolean;
}

export const getPostMessageStream = ({
  name,
  communicationLayerPreference,
  remoteConnection,
  walletConnect,
  debug,
}: GetPostMessageStreamProps): PostMessageStream => {
  if (
    communicationLayerPreference ===
      CommunicationLayerPreference.WALLETCONNECT &&
    walletConnect
  ) {
    return new WalletConnectPostMessageStream({
      name,
      wcConnector: walletConnect.getConnector(),
    });
  }

  if (!remoteConnection || !remoteConnection?.getConnector()) {
    throw new Error(`Missing remote conenction parameter`);
  }

  return new RemoteCommunicationPostMessageStream({
    name,
    remote: remoteConnection?.getConnector(),
    debug,
  });
};
