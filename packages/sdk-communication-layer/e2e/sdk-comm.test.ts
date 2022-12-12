import { describe, expect, it } from '@jest/globals';
import {
  CommunicationLayerType,
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

describe('SDK Comm Server', () => {
  it('should establish client/mobile connection through comm server', async () => {
    jest.setTimeout(100000000); // infinite....
    const communicationLayerType = CommunicationLayerType.SOCKET;
    const platform = 'jest';
    const communicationServerUrl = 'http://localhost:4000/';

    const remote = new RemoteCommunication({
      communicationLayerType,
      platform,
      communicationServerUrl,
    });

    const { channelId, pubKey } = remote.generateChannelId();
    remote.on(MessageType.MESSAGE, (message) => {
      console.debug(`received message`, message);
    });

    remote.on(MessageType.CLIENTS_READY, (message) => {
      console.debug(`clients READY !`, message);
    });

    const mmRemote = new RemoteCommunication({
      communicationLayerType,
      platform,
      otherPublicKey: pubKey,
      communicationServerUrl,
    });

    mmRemote.connectToChannel(channelId);
    const message = await waitForEvent(mmRemote, MessageType.CLIENTS_READY);

    expect(message).toBeDefined();

    remote.disconnect();
    mmRemote.disconnect();
  });
});
