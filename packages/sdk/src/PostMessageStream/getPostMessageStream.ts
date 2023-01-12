import { CommunicationLayerPreference } from '@metamask/sdk-communication-layer';
import { ProviderConstants } from '../constants';
import { Platform } from '../Platform/Platfform';
import { RemoteConnection } from '../services/RemoteConnection';
import { WalletConnect } from '../services/WalletConnect';
import { PlatformType } from '../types/PlatformType';
import { PostMessageStream } from './PostMessageStream';
import { RemoteCommunicationPostMessageStream } from './RemoteCommunicationPostMessageStream';
import { WalletConnectPostMessageStream } from './WalletConnectPostMessageStream';
import { WebPostMessageStream } from './WebPostMessageStream';

export interface GetPostMessageStreamProps {
  name: ProviderConstants;
  target: ProviderConstants;
  remoteConnection?: RemoteConnection;
  walletConnect?: WalletConnect;
  communicationLayerPreference: CommunicationLayerPreference;
}

export const getPostMessageStream = ({
  name,
  target,
  communicationLayerPreference,
  remoteConnection,
  walletConnect,
}: GetPostMessageStreamProps): PostMessageStream => {
  const platformType = Platform.getInstance().getPlatformType();

  if (platformType === PlatformType.MetaMaskMobileWebview) {
    // FIXME incompatible Duplex types?
    // WindowPostMessageStream should extend Duplex indirectly, why do we need to cast...
    return new WebPostMessageStream({
      name,
      target,
    }) as unknown as PostMessageStream;
  }

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

  if (!remoteConnection) {
    throw new Error(`Missing remote conenction parameter`);
  }

  console.log(`using RemoteCommunicationPostMessageStream`);
  return new RemoteCommunicationPostMessageStream({
    name,
    remote: remoteConnection.getConnector(),
  });
};
