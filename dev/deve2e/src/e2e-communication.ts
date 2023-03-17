import {
  CommunicationLayerPreference,
  EventType,
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
    context: 'dapp',
    logging: {
      eciesLayer: false,
      keyExchangeLayer: false,
      remoteLayer: false,
      serviceLayer: false,
    },
    analytics: true,
  });

  const { channelId, pubKey } = await remote.generateChannelId();

  remote.on(EventType.CLIENTS_READY, () => {
    clientsReady = true;
  });

  const mmRemote = new RemoteCommunication({
    communicationLayerPreference,
    platform,
    otherPublicKey: pubKey,
    communicationServerUrl,
    context: 'metamask',
    analytics: true,
    logging: {
      eciesLayer: false,
      keyExchangeLayer: false,
      remoteLayer: false,
      serviceLayer: false,
    },
  });

  mmRemote.connectToChannel(channelId);

  await waitForReady();

  remote.disconnect();
  mmRemote.disconnect();
};
