import {
  CommunicationLayerMessage,
  RemoteCommunication,
} from '@metamask/sdk-communication-layer';
import { CommunicationLayerPreference, MessageType } from '../src';

describe('MetaMask Simulator', () => {
  let clientDisconnected = false;
  let channelId: string;
  let pubkey: string;

  beforeAll(async () => {
    // Extract url from other test case:
    // jest -c ./jest.config.ts --detectOpenHandles ./e2e/sdk-e2e.test.ts -t 'SDK should communicate as a DAPP'
    const url = new URL(
      'https://metamask.app.link/connect?channelId=fbda8922-ffbc-4133-aa2c-a8e1ea7a75f5&comm=socket&pubkey=037fbc2c72e30ff9017637287236ab988f17dc535e2dc5c1e6ab85fa104d15d44a',
    );
    channelId = url.searchParams.get('channelId') ?? '';
    pubkey = url.searchParams.get('pubkey') ?? '';
  });

  it('should simulate MM mobile', async () => {
    console.log(
      `Running connect-sdk simulation with channelId=${channelId} pubkey=${pubkey}`,
    );

    const mmProviderName = 'metamask-provider';
    const maxCheck = 3;
    let currentCheck = 1;
    const waitForDisconnect = async (): Promise<void> => {
      return new Promise<void>((resolve) => {
        const ref = setInterval(() => {
          console.debug(
            `[${currentCheck}] check if disconnected ${clientDisconnected}`,
          );
          currentCheck += 1;
          if (clientDisconnected || currentCheck > maxCheck) {
            clearTimeout(ref);
            resolve();
          }
        }, 3000);
      });
    };

    const mmRemote = new RemoteCommunication({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      platformType: 'metamask-mobile',
      otherPublicKey: pubkey,
      // communicationServerUrl: 'http://localhost:4000',
      context: 'mm',
      logging: {
        eciesLayer: true,
        keyExchangeLayer: true,
        remoteLayer: true,
        serviceLayer: true,
      },
      analytics: true,
    });

    mmRemote.on('clients_disconnected', () => {
      console.debug(`clients disconnected!`);
      clientDisconnected = true;
    });

    mmRemote.on('clients_ready', (_readyMsg) => {
      // mm now setup background bridges
      mmRemote.sendMessage({
        name: mmProviderName,
        data: {
          method: 'metamask_chainChanged',
          params: {
            networkVersion: '1',
            chainId: '0x1',
          },
        },
      });
    });

    mmRemote.on('message', (message: CommunicationLayerMessage) => {
      console.log('mmRemote::on "message" ', message);
      try {
        if (message.method?.toLowerCase() === 'eth_requestaccounts') {
          // fake reply
          const reply = {
            name: mmProviderName,
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
            name: mmProviderName,
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
