import { describe, expect, it } from '@jest/globals';
import {
  CommunicationLayerPreference,
  RemoteCommunication,
  MessageType,
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
