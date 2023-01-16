import * as fs from 'fs';
import {
  CommunicationLayerMessage,
  CommunicationLayerPreference,
  MessageType,
  RemoteCommunication,
} from '@metamask/sdk-communication-layer';
import { e2eConfig } from '@metamask/sdk-communication-layer/e2e/shared-e2e.config';

describe('MetaMask Simulator', () => {
  let clientDisconnected = false;
  let channelId: string;
  let pubkey: string;

  beforeAll(async () => {
    // TODO allow fixed roomId setup for e2e
    if (fs.existsSync(e2eConfig.tempFileName)) {
      try {
        const config = JSON.parse(
          fs.readFileSync(e2eConfig.tempFileName, 'utf8'),
        );
        console.log(`found environment: ${config}`);
        channelId = config.channelId;
        pubkey = config.pubKey;
      } catch (err) {
        console.warn(`Invalid configuration file`, err);
      }
    } else {
      // console.warn(
      //   `Environment file not found.\nDid you run 'yarn test -t "should test correctly"' ?`,
      // );
      const url = new URL(
        'https://metamask.app.link/connect?channelId=b7398646-1d66-43c2-b64a-1f023bc35fbc&comm=socket&pubkey=021063057d27168cfefb9fd779353b74fbe6746d302a39ba849c1f3cfd2df9f68f',
      );
      channelId = url.searchParams.get('channelId') ?? '';
      pubkey = url.searchParams.get('pubkey') ?? '';
    }
  });

  it('should simulate MM mobile', async () => {
    console.log(
      `Running connect-sdk simulation with channelId=${channelId} pubkey=${pubkey}`,
    );

    const waitForDisconnect = async (): Promise<void> => {
      return new Promise<void>((resolve) => {
        const ref = setInterval(() => {
          console.debug(`check if disconnected ${clientDisconnected}`);
          if (clientDisconnected) {
            clearTimeout(ref);
            resolve();
          }
        }, 3000);
      });
    };

    const mmRemote = new RemoteCommunication({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      platform: 'test',
      otherPublicKey: pubkey,
      communicationServerUrl: 'http://localhost:5400',
      context: 'mm',
      enableDebug: true,
    });

    mmRemote.on('clients_disconnected', () => {
      console.debug(`clients disconnected!`);
      clientDisconnected = true;
    });

    mmRemote.on('clients_ready', (readyMsg) => {
      console.log('clients_ready', readyMsg);
      console.log(`setting up backgroundBridge`);
    });

    mmRemote.on('message', (message: CommunicationLayerMessage) => {
      console.log('mmRemote.on[message]: ', message);
      try {
        if (message.method?.toLowerCase() === 'eth_requestaccounts') {
          // fake reply
          const reply = {
            name: 'metamask-provider',
            data: {
              id: message.id,
              jsonrpc: '2.0',
              result: ['0x123', '0xbadbeef'],
            },
            type: MessageType.JSONRPC,
          };
          console.log('replying: ', reply);
          mmRemote.sendMessage(reply);
        }

        if (message.method?.toLowerCase() === 'eth_signtypeddata_v3') {
          // fake reply
          const reply = {
            name: 'metamask-provider',
            data: {
              id: message.id,
              jsonrpc: '2.0',
              result: '0x1234555555555555555555555555555',
            },
            type: MessageType.JSONRPC,
          };
          console.log('replying: ', reply);
          mmRemote.sendMessage(reply);
        }
      } catch (err) {
        console.error('oospie', err);
      }
    });

    mmRemote.connectToChannel(channelId);

    await waitForDisconnect();
    mmRemote.disconnect();

    expect(true).toBe(true);
  }, 100000000);
});
