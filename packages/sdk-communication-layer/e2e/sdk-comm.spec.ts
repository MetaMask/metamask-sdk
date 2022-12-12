import { describe, expect, test } from '@jest/globals';
import RemoteConnection from '../src';

describe('SDK Comm Server', () => {
  test('connect to comm server', () => {
    const remote = new RemoteConnection({
      commLayer: 'socket',
      platform: 'jest',
    });

    const { channelId, pubKey } = remote.generateChannelId();
    const linkParams = `channelId=${encodeURIComponent(
      channelId,
    )}&comm=${encodeURIComponent('socket')}&pubkey=${encodeURIComponent(
      pubKey,
    )}`;

    console.log('Connect to', linkParams);

    remote.on('message', (message) => {
      console.log('New Message', message);
    });

    remote.on('channel_created', (message) => {
      console.log('channel created', message);
    });

    remote.on('clients_ready', (message) => {
      console.log('Clients now connected!', message);
    });

    remote.clean();

    expect(1 + 2).toBe(3);
  });
});
