import { describe, expect, it } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import {
  CommunicationLayerPreference,
  EventType,
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


describe('SDK Communication Layer', () => {
  let clientsReady = false;

  it('should establish client/mobile connection through comm server with remote key exchange', async () => {
    const communicationLayerPreference = CommunicationLayerPreference.SOCKET;
    const platform = 'jest';
    const communicationServerUrl = 'http://localhost:4000/';
    // const communicationServerUrl =
      // 'https://metamask-sdk.api.cx.metamask.io/';

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

    // TODO allow for fixed roomid / pubkey setup during testing
    // fs.writeFileSync(
    //   e2eConfig.tempFileName,
    //   JSON.stringify({ channelId, pubKey }),
    // );

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

    await waitForReady();

    // initiator

    mmRemote.disconnect();
    remote.disconnect();

    expect(clientsReady).toBe(true);
  });

  it('should establish key/exchange with mobile connected first', async () => {
    const communicationServerUrl = 'http://localhost:4000/';
    const channelId = uuidv4();
    const protocolVersion = 2;

    // dApp opens connection (instanciate remote but doesnt always connect)
    const remote = new RemoteCommunication({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      platformType: 'metamask-mobile',
      protocolVersion,
      relayPersistence: true,
      communicationServerUrl,
      analytics: true,
      logging: {
        eciesLayer: true,
        keyExchangeLayer: true,
        remoteLayer: true,
        serviceLayer: true,
        plaintext: true,
      },
      context: 'initiator',
    });
    // sdk builds deeplink url and opens it
    const clientPublicKey = remote.getKeyInfo()?.ecies.public ?? '';

    // Wallet connects to server and sends public key and can disconnect
    // SDK connects to server and fetches wallet public key and can complte key exchange
    // const deeplinkUrl = `channelId=${channelId}&v=${protocolVersion}&comm=socket&pubkey=${clientPublicKey}&t=q&sdkVersion=${sdkVersion}&originatorInfo=${base64OriginatorInfo}`;
    const mmRemote = new RemoteCommunication({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      platformType: 'metamask-mobile',
      communicationServerUrl,
      protocolVersion,
      reconnect: false,
      relayPersistence: true,
      otherPublicKey: clientPublicKey,
      analytics: true,
      logging: {
        eciesLayer: true,
        keyExchangeLayer: true,
        remoteLayer: true,
        serviceLayer: true,
        plaintext: true,
      },
      context: 'mm',
    });
    await mmRemote.connectToChannel({ channelId, authorized: true });

    await remote.connectToChannel({ channelId });

    // Send message from sdk to wallet
    await remote.sendMessage({
      params: ['world'],
      method: 'hello',
    })

    // wait for receicing message from dApp
    await waitForEvent(mmRemote, 'message');

    mmRemote.disconnect();
    remote.disconnect();

    expect(true).toBe(true);
  });

  it('[backward compatible] should establish key/exchange with dApp connected first', async () => {
    const communicationServerUrl = 'http://localhost:4000/';
    const channelId = uuidv4();
    const protocolVersion = 2;

    // dApp opens connection
    const remote = new RemoteCommunication({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      platformType: 'metamask-mobile',
      protocolVersion,
      relayPersistence: true,
      communicationServerUrl,
      analytics: true,
      logging: {
        eciesLayer: true,
        keyExchangeLayer: true,
        remoteLayer: true,
        serviceLayer: true,
        plaintext: true,
      },
      context: 'initiator',
    });
    // sdk builds deeplink url and opens it
    const clientPublicKey = remote.getKeyInfo()?.ecies.public ?? '';

    await remote.connectToChannel({ channelId });

    const mmRemote = new RemoteCommunication({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      platformType: 'metamask-mobile',
      communicationServerUrl,
      protocolVersion,
      reconnect: false,
      relayPersistence: true,
      otherPublicKey: clientPublicKey,
      analytics: true,
      logging: {
        eciesLayer: true,
        keyExchangeLayer: true,
        remoteLayer: true,
        serviceLayer: true,
        plaintext: true,
      },
      context: 'mm',
    });
    await mmRemote.connectToChannel({ channelId, authorized: true });


    await waitForCondition({
      fn: () => {
        return remote.isAuthorized()
      },
      context: 'wait_auth',
      waitTime: 1000,
    })

    // Send message from sdk to wallet
    await remote.sendMessage({
      params: ['world'],
      method: 'hello',
    })

    // wait for receicing message from dApp
    await waitForEvent(mmRemote, 'message');

    mmRemote.disconnect();
    remote.disconnect();

    expect(true).toBe(true);
  });

  it('should establish key/exchange with 1side connected', async () => {
    const communicationServerUrl = 'http://localhost:4000/';
    const channelId = uuidv4();
    const protocolVersion = 2;

    // dApp opens connection (instanciate remote but doesnt always connect)
    const remote = new RemoteCommunication({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      platformType: 'metamask-mobile',
      protocolVersion,
      relayPersistence: true,
      communicationServerUrl,
      analytics: true,
      logging: {
        eciesLayer: true,
        keyExchangeLayer: true,
        remoteLayer: true,
        serviceLayer: true,
        plaintext: true,
      },
      context: 'initiator',
    });
    // sdk builds deeplink url and opens it
    const clientPublicKey = remote.getKeyInfo()?.ecies.public ?? '';

    // Wallet connects to server and sends public key and can disconnect
    // SDK connects to server and fetches wallet public key and can complte key exchange
    // const deeplinkUrl = `channelId=${channelId}&v=${protocolVersion}&comm=socket&pubkey=${clientPublicKey}&t=q&sdkVersion=${sdkVersion}&originatorInfo=${base64OriginatorInfo}`;
    const mmRemote = new RemoteCommunication({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      platformType: 'metamask-mobile',
      communicationServerUrl,
      protocolVersion,
      reconnect: false,
      relayPersistence: true,
      otherPublicKey: clientPublicKey,
      analytics: true,
      logging: {
        eciesLayer: true,
        keyExchangeLayer: true,
        remoteLayer: true,
        serviceLayer: true,
        plaintext: true,
      },
      context: 'mm',
    });
    await mmRemote.connectToChannel({ channelId, authorized: true });
    mmRemote.disconnect();

    await remote.connectToChannel({ channelId });
    // Send message from sdk to wallet
    await remote.sendMessage({
      params: ['world'],
      method: 'hello',
    })
    remote.disconnect();

    // Reconnect and see if it receives the message
    await mmRemote.connectToChannel({ channelId, authorized: true });
    // wait for receicing message from dApp
    await waitForEvent(mmRemote, 'message');

    mmRemote.disconnect();
    remote.disconnect();

    expect(true).toBe(true);
  });

  it(`should inform sdk if connection is refused`, async () => {
    // TODO
  })
});

