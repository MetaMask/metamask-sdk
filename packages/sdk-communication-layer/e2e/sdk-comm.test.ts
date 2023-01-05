import { describe, expect, it } from '@jest/globals';
import {
  CommunicationLayerPreference,
  RemoteCommunication,
  MessageType,
  ECIES,
} from '../src';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const waitForEvent = (
  remoteConn: RemoteCommunication,
  event: string,
): Promise<unknown> => {
  return new Promise((resolve) => {
    remoteConn.on(event, (message: unknown) => {
      return resolve(message);
    });
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sleep = (ms: number) => {
  return new Promise((resolve) => {
    const ref = setTimeout(resolve, ms);
    return () => {
      clearTimeout(ref);
    };
  });
};

describe('SDK Comm Server', () => {
  let clientsReady = false;

  it('should establish client/mobile connection through comm server', async () => {
    jest.setTimeout(100000000); // infinite....
    const communicationLayerPreference = CommunicationLayerPreference.SOCKET;
    const platform = 'jest';
    const communicationServerUrl = 'http://localhost:4000/';
    // const communicationServerUrl =
    //   'https://metamask-sdk-socket.metafi.codefi.network/';

    const waitForReady = async (): Promise<void> => {
      return new Promise<void>((resolve) => {
        const ref = setInterval(() => {
          // console.debug(`check if ready ${clientsReady}`);
          if (clientsReady) {
            clearTimeout(ref);
            resolve();
          }
        }, 1000);
      });
    };

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

    expect(clientsReady).toBe(true);
  });
});

describe('SDK ECIES Encryption', () => {
  const Alice = new ECIES();
  const Bob = new ECIES();

  Alice.generateECIES();
  Bob.generateECIES();

  const AlicePublicKey = Alice.getPublicKey();
  const BobPublicKey = Bob.getPublicKey();

  it('should encrypt message from Alice to Bob and Bob decrypt it', async () => {
    const message = 'This is a message from Alice to Bob';
    const encryptedMessage = Alice.encrypt(message, BobPublicKey);
    const decryptedMessage = Bob.decrypt(encryptedMessage);

    console.debug('Alice -> Bob');
    console.debug('Original:', message);
    console.debug('Encrypted:', encryptedMessage);
    console.debug('Decrypted:', decryptedMessage);
    expect(decryptedMessage).toBe(message);
  });

  it('should encrypt message from Bob to Alice and Alice decrypt it', async () => {
    const message = 'This is a message from Bob to Alice';
    const encryptedMessage = Bob.encrypt(message, AlicePublicKey);
    const decryptedMessage = Alice.decrypt(encryptedMessage);

    console.debug('Bob -> Alice');
    console.debug('Original:', message);
    console.debug('Encrypted:', encryptedMessage);
    console.debug('Decrypted:', decryptedMessage);
    expect(decryptedMessage).toBe(message);
  });
});
