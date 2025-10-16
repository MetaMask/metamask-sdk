import { describe, expect, it } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import {
  CommunicationLayerPreference,
  RemoteCommunicationProps,
  EventType,
  MessageType,
  RemoteCommunication
} from '../src';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const waitForEvent = (
  remoteConn: RemoteCommunication,
  event: string,
): Promise<unknown> => {
  return new Promise((resolve) => {
    remoteConn.on(event, (message: unknown) => {
      console.log(`Received event ${event}`, message);
      return resolve(message);
    });
  });
};


const sleep = (ms: number) => {
  return new Promise((resolve) => {
    const ref = setTimeout(resolve, ms);
    return () => {
      clearTimeout(ref);
    };
  });
};

export const waitForCondition = async ({
  fn,
  context,
  waitTime = 1000,
}: {
  fn: () => boolean;
  waitTime?: number;
  context?: string;
}) => {
  let i = 0;
  while (!fn()) {
    i += 1;
    if (i > 5 && i % 10 === 0) {
      console.log(`Waiting for fn context=${context} to return true`);
    }
    await sleep(waitTime);
  }
};

export const getClient = ({ type, options }: { type: 'dApp' | 'wallet', options: Partial<RemoteCommunicationProps> }) => {
  const client = new RemoteCommunication({
    context: `${type}-jest`,
    communicationLayerPreference: CommunicationLayerPreference.SOCKET,
    platformType: 'metamask-mobile',
    protocolVersion: 2,
    reconnect: false,
    relayPersistence: true,
    analytics: true,
    logging: {
      eciesLayer: true,
      keyExchangeLayer: true,
      remoteLayer: true,
      serviceLayer: true,
      plaintext: true,
    },
    ...options, // overwrite default options
  });
  return client
}

describe('SDK Communication Layer', () => {
  let clientsReady = false;
  const communicationServerUrl = 'http://localhost:4000'; // Adjust with your server url

  describe('Protocol V1', () => {
    it('should establish client/mobile connection through comm server with remote key exchange', async () => {
      const communicationLayerPreference = CommunicationLayerPreference.SOCKET;

      const remote = new RemoteCommunication({
        communicationLayerPreference,
        platformType: 'metamask-mobile',
        communicationServerUrl,
        dappMetadata: {
          name: 'jest dapp',
          url: 'http://somehwere.com',
        },
        context: 'initiator',
        analytics: true,
        logging: {
          eciesLayer: true,
          keyExchangeLayer: true,
          remoteLayer: true,
          serviceLayer: true,
          plaintext: true,
        },
      });

      // Generate new channel id and connect to it
      const { channelId, pubKey } = await remote.generateChannelIdConnect();

      remote.on(EventType.CLIENTS_READY, () => {
        clientsReady = true;
      });

      const mmRemote = new RemoteCommunication({
        communicationLayerPreference,
        platformType: 'metamask-mobile',
        otherPublicKey: pubKey,
        communicationServerUrl,
        analytics: true,
        dappMetadata: {
          name: 'SDK-COMM_TEST',
          url: 'http://somewhere.com',
        },
        logging: {
          eciesLayer: true,
          keyExchangeLayer: true,
          remoteLayer: true,
          serviceLayer: true,
          plaintext: true,
        },
        context: 'mm',
      });

      mmRemote.connectToChannel({ channelId });

      await waitForCondition({ fn: () => clientsReady, context: 'clientsReady', waitTime: 1000 });

      mmRemote.disconnect();
      remote.disconnect();

      expect(clientsReady).toBe(true);
    });
  })

  describe('Protocol V2', () => {
    it('should establish key/exchange with mobile connected first', async () => {
      const channelId = uuidv4();

      const dAppClient = getClient({
        type: 'wallet', options: {
          communicationServerUrl
        }
      })
      await dAppClient.initFromDappStorage();
      const clientPublicKey = dAppClient.getKeyInfo()?.ecies.public ?? 'aaa';

      const walletClient = getClient({ type: 'dApp', options: { communicationServerUrl, otherPublicKey: clientPublicKey } });

      await dAppClient.connectToChannel({ channelId });
      await walletClient.connectToChannel({ channelId, authorized: true });

      // Send message from sdk to wallet
      await dAppClient.sendMessage({
        params: ['world'],
        method: 'hello',
      })

      // wait for receicing message from dApp
      await waitForEvent(walletClient, 'message');
      // sleep(5000); // need times for ack the message

      walletClient.disconnect();
      dAppClient.disconnect();

      expect(true).toBe(true);
    });

    it('should establish key/exchange with dApp connected first', async () => {
      const channelId = uuidv4();

      const dAppClient = getClient({
        type: 'dApp', options: {
          communicationServerUrl
        }
      })
      await dAppClient.initFromDappStorage();
      await dAppClient.connectToChannel({ channelId });

      const clientPublicKey = dAppClient.getKeyInfo()?.ecies.public ?? '';

      const walletClient = getClient({ type: 'wallet', options: { communicationServerUrl, otherPublicKey: clientPublicKey } });
      await walletClient.connectToChannel({ channelId, authorized: true });

      await waitForCondition({
        fn: () => {
          return dAppClient.isAuthorized()
        },
        context: 'wait_auth',
        waitTime: 1000,
      })

      // Send message from sdk to wallet
      await dAppClient.sendMessage({
        params: ['world'],
        method: 'hello',
      })

      // wait for receicing message from dApp
      await waitForEvent(walletClient, 'message');

      walletClient.disconnect();
      dAppClient.disconnect();

      expect(true).toBe(true);
    });

    it('should establish key/exchange with 1side connected at anytime', async () => {
      const channelId = uuidv4();

      const dAppClient = getClient({
        type: 'dApp', options: {
          communicationServerUrl
        }
      })
      await dAppClient.initFromDappStorage();
      await dAppClient.connectToChannel({ channelId });

      const clientPublicKey = dAppClient.getKeyInfo()?.ecies.public ?? '';

      const walletClient = getClient({ type: 'wallet', options: { communicationServerUrl, otherPublicKey: clientPublicKey } });

      await walletClient.connectToChannel({ channelId, authorized: true });
      await walletClient.sendMessage({
        type: MessageType.WALLET_INIT,
        data: {
          chainId: '0x1',
          accounts: ['0x123'],
        }
      })
      walletClient.disconnect();

      await dAppClient.connectToChannel({ channelId });
      // Send message from sdk to wallet
      await dAppClient.sendMessage({
        params: ['world'],
        method: 'hello',
      })
      dAppClient.disconnect();

      // Reconnect and see if it receives the message
      await walletClient.connectToChannel({ channelId, authorized: true });
      // wait for receicing message from dApp
      await waitForEvent(walletClient, 'message');

      walletClient.disconnect();
      dAppClient.disconnect();

      expect(true).toBe(true);
    });

    it('should reconnect to an existing channel with persistence', async () => {
      const channelId = uuidv4();

      const dAppClient = getClient({
        type: 'dApp', options: {
          communicationServerUrl
        }
      })
      await dAppClient.initFromDappStorage();
      await dAppClient.connectToChannel({ channelId });

      const clientPublicKey = dAppClient.getKeyInfo()?.ecies.public ?? '';

      const walletClient = getClient({ type: 'wallet', options: { communicationServerUrl, otherPublicKey: clientPublicKey } });

      await walletClient.connectToChannel({ channelId, authorized: true });

      dAppClient.disconnect();

      await walletClient.sendMessage({
        type: MessageType.WALLET_INIT,
        data: {
          chainId: '0x1',
          accounts: ['0x123'],
        }
      })

      // dApp reconnect
      await dAppClient.connectToChannel({ channelId });

      // wait for receicing message from wakket
      await waitForEvent(dAppClient, 'message');

      // Send message from sdk to wallet and disconnect, wallet should receive message anyway
      await dAppClient.sendMessage({
        params: ['world'],
        method: 'hello',
      })
      // wait for receicing message from dApp
      await waitForEvent(walletClient, 'message');

      await sleep(1000);
      walletClient.disconnect();
      dAppClient.disconnect();

      expect(true).toBe(true);
    });
  })
});

