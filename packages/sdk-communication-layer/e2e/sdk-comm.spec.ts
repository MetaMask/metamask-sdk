import { describe, expect, test } from '@jest/globals';
import RemoteConnection from '../src';

const waitForEvent = (
  remoteConn: RemoteConnection,
  event: string,
): Promise<unknown> => {
  return new Promise((resolve) => {
    remoteConn.on(event, (message: unknown) => {
      return resolve(message);
    });
  });
};

describe('SDK Comm Server', () => {
  test('connect to comm server', () => {
    const commLayer = 'socket';
    const platform = 'jest';

    const remote = new RemoteConnection({
      commLayer,
      platform,
    });

    const { channelId, pubKey } = remote.generateChannelId();

    const mmRemote = new RemoteConnection({
      commLayer,
      platform,
      otherPublicKey: pubKey,
    });

    mmRemote.connectToChannel(channelId);
    const p = waitForEvent(mmRemote, 'clients_ready');

    expect(p).resolves.toBeDefined();

    remote.disconnect();
    mmRemote.disconnect();
  });
});
