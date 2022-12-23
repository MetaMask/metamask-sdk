import {
  CommunicationLayerPreference,
  MessageType,
  RemoteCommunication,
} from '@metamask/sdk-communication-layer';

let clientsReady = false;

const waitForReady = async (): Promise<void> => {
  return new Promise<void>((resolve) => {
    const ref = setInterval(() => {
      console.debug(`check if ready ${clientsReady}`);
      if (clientsReady) {
        clearTimeout(ref);
        resolve();
      }
    }, 1000);
  });
};

export const mainCommunication = async () => {
  const communicationLayerPreference = CommunicationLayerPreference.SOCKET;
  const platform = 'jest';
  const communicationServerUrl = 'http://localhost:4000/';

  const remote = new RemoteCommunication({
    communicationLayerPreference,
    platform,
    communicationServerUrl,
    context: 'initiator',
  });

  const { channelId, pubKey } = remote.generateChannelId();

  remote.on(MessageType.CLIENTS_READY, () => {
    clientsReady = true;
  });

  const mmRemote = new RemoteCommunication({
    communicationLayerPreference,
    platform,
    otherPublicKey: pubKey,
    communicationServerUrl,
    context: 'mm',
  });

  mmRemote.connectToChannel(channelId);

  await waitForReady();

  remote.disconnect();
  mmRemote.disconnect();
};
