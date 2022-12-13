import { describe, expect, it } from '@jest/globals';
import {
  CommunicationLayerPreference,
  RemoteCommunication,
  MessageType,
} from '../src';

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
  it('should establish client/mobile connection through comm server', async () => {
    jest.setTimeout(100000000); // infinite....
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
    remote.on(MessageType.MESSAGE, (message) => {
      console.debug(`received message`, message);
    });

    remote.on(MessageType.CLIENTS_READY, (message) => {
      console.debug(`clients READY !`, message);
    });

    const mmRemote = new RemoteCommunication({
      communicationLayerPreference,
      platform,
      otherPublicKey: pubKey,
      communicationServerUrl,
      context: 'mm',
    });

    mmRemote.connectToChannel(channelId);
    const message = await waitForEvent(mmRemote, MessageType.CLIENTS_READY);

    expect(message).toBeDefined();

    remote.disconnect();
    mmRemote.disconnect();
  });
});
