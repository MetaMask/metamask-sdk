import {
  CommunicationLayerPreference,
  MessageType,
  RemoteCommunication,
  ECIES,
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
  const communicationServerUrl = 'http://localhost:5400/';

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

export const ECIESEncryptedCommunicaition = async () => {
  const Alice = new ECIES();
  const Bob = new ECIES();

  Alice.generateECIES();
  Bob.generateECIES();

  const AlicePublicKey = Alice.getPublicKey();
  const BobPublicKey = Bob.getPublicKey();

  const ABMessage = 'This is a message from Alice to Bob';
  const ABEncryptedMessage = Alice.encrypt(ABMessage, BobPublicKey);
  const ABDecryptedMessage = Bob.decrypt(ABEncryptedMessage);

  console.debug('Alice -> Bob');
  console.debug('Original:', ABMessage);
  console.debug('Encrypted:', ABEncryptedMessage);
  console.debug('Decrypted:', ABDecryptedMessage);
  if (ABMessage === ABDecryptedMessage) {
    console.debug("Bob successfully decrypted Alice's message\n");
  } else {
    console.error("Bob did not decrypt Alice's message!\n");
  }

  const BAMessage = 'This is a message from Bob to Alice';
  const BAEncryptedMessage = Bob.encrypt(BAMessage, AlicePublicKey);
  const BADecryptedMessage = Alice.decrypt(BAEncryptedMessage);

  console.debug('Bob -> Alice');
  console.debug('Original:', BAMessage);
  console.debug('Encrypted:', BAEncryptedMessage);
  console.debug('Decrypted:', BADecryptedMessage);
  if (BAMessage === BADecryptedMessage) {
    console.debug("Alice successfully decrypted Bob's message");
  } else {
    console.error("Alice did not decrypt Bob's message!");
  }
};
