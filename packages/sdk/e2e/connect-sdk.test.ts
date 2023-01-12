import crypto from 'crypto';
import {
  CommunicationLayerPreference,
  RemoteCommunication,
} from '@metamask/sdk-communication-layer';
import { sleep } from './utils/sleep';

describe('Connect SDK', () => {
  it('should simulate MM mobile', async () => {
    const url = new URL(
      'https://metamask.app.link/connect?channelId=4da6e9dc-ea03-498b-9a34-d08334608d0e&comm=socket&pubkey=0349b012212fec7afab9679b8400ceea0c916db9f2f92529ef5a82e3873d912973',
    );
    const channelId = url.searchParams.get('channelId') ?? '';
    const pubkey = url.searchParams.get('pubkey') ?? '';
    console.log(`channelId: ${channelId}`);
    console.log(`pubkey: ${pubkey}`);

    const mmRemote = new RemoteCommunication({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      platform: 'test',
      otherPublicKey: pubkey,
      communicationServerUrl: 'http://192.168.50.114:5400',
      context: 'mm',
      enableDebug: true,
    });

    mmRemote.on('clients_disconnected', () => {
      console.log('disconnected');
      mmRemote.disconnect();
    });

    mmRemote.on('clients_ready', (message) => {
      console.log('clients_ready', message);

      console.log(`setting up backgroundBridge`)
      mmRemote.on('message', (message) => {
        console.log('message: ', message);
      });
    });

    mmRemote.connectToChannel(channelId);

    await sleep(100000000);
    expect(true).toBe(true);
  }, 100000000);
});
