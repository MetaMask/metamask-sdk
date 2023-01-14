import { describe, expect, it } from '@jest/globals';
import {
  CommunicationLayerPreference,
  MessageType,
  RemoteCommunication,
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
    const communicationLayerPreference = CommunicationLayerPreference.SOCKET;
    const platform = 'jest';
    const communicationServerUrl = 'http://localhost:5400/';
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
      dappMetadata: {
        name: 'jest dapp',
        url: 'http://somehwere.com',
      },
      context: 'initiator',
      enableDebug: false,
      ecies: {
        enabled: true,
      },
    });

    const { channelId, pubKey } = remote.generateChannelId();

    // TODO allow for fixed roomid / pubkey setup during testing
    // fs.writeFileSync(
    //   e2eConfig.tempFileName,
    //   JSON.stringify({ channelId, pubKey }),
    // );

    remote.on(MessageType.CLIENTS_READY, () => {
      clientsReady = true;
    });

    const mmRemote = new RemoteCommunication({
      communicationLayerPreference,
      platform,
      otherPublicKey: pubKey,
      communicationServerUrl,
      dappMetadata: {
        name: 'SDK-COMM_TEST',
        url: 'http://somewhere.com',
      },
      context: 'mm',
    });

    mmRemote.connectToChannel(channelId);

    await waitForReady();

    // initiator

    mmRemote.disconnect();
    remote.disconnect();

    expect(clientsReady).toBe(true);
  });

  // TODO validate webrtc and walletconnect
  // it.skip(`should work with WebRTC on top of socketio`, async () => {
  //   const platform = 'jest';
  //   const communicationServerUrl = 'http://localhost:4000/';

  //   const waitForReady = async (): Promise<void> => {
  //     return new Promise<void>((resolve) => {
  //       const ref = setInterval(() => {
  //         // console.debug(`check if ready ${clientsReady}`);
  //         if (clientsReady) {
  //           clearTimeout(ref);
  //           resolve();
  //         }
  //       }, 1000);
  //     });
  //   };

  //   const remote = new RemoteCommunication({
  //     communicationLayerPreference: CommunicationLayerPreference.SOCKET,
  //     platform,
  //     communicationServerUrl,
  //     context: 'initiator',
  //     enableDebug: true,
  //   });

  //   const { channelId, pubKey } = remote.generateChannelId();

  //   remote.on(MessageType.CLIENTS_READY, () => {
  //     clientsReady = true;
  //   });

  //   const mmRemote = new RemoteCommunication({
  //     communicationLayerPreference: CommunicationLayerPreference.WEBRTC,
  //     platform,
  //     otherPublicKey: pubKey,
  //     communicationServerUrl,
  //     context: 'mm',
  //   });

  //   mmRemote.connectToChannel(channelId);

  //   await waitForReady();

  //   mmRemote.disconnect();
  //   remote.disconnect();

  //   expect(clientsReady).toBe(true);
  // });
});
