/* eslint-disable jsdoc/require-jsdoc */
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { v4 as uuidv4 } from 'uuid';
import { Server as IOServer } from 'socket.io';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';

const mockPubClient = {
  on: jest.fn(),
  duplicate: jest.fn(() => ({ on: jest.fn() })),
  get: jest.fn(),
  set: jest.fn(),
  setex: jest.fn(),
  incrby: jest.fn().mockResolvedValue(1),
  del: jest.fn(),
};

jest.mock('./analytics-api', () => ({
  pubClient: mockPubClient,
}));

jest.mock('@socket.io/redis-adapter', () => ({
  createAdapter: () => undefined,
}));

const handleAck = jest.fn().mockResolvedValue(undefined);
const handlePing = jest.fn().mockResolvedValue(undefined);
const handleMessage = jest.fn().mockResolvedValue(undefined);
const handleChannelRejected = jest.fn().mockResolvedValue(undefined);
const handleJoinChannel = jest.fn().mockResolvedValue(undefined);
const handleCheckRoom = jest.fn().mockResolvedValue(undefined);

jest.mock('./protocol/handleAck', () => ({
  handleAck: (...args: unknown[]) => handleAck(...args),
}));
jest.mock('./protocol/handlePing', () => ({
  handlePing: (...args: unknown[]) => handlePing(...args),
}));
jest.mock('./protocol/handleMessage', () => ({
  handleMessage: (...args: unknown[]) => handleMessage(...args),
}));
jest.mock('./protocol/handleChannelRejected', () => ({
  handleChannelRejected: (...args: unknown[]) => handleChannelRejected(...args),
}));
jest.mock('./protocol/handleJoinChannel', () => ({
  handleJoinChannel: (...args: unknown[]) => handleJoinChannel(...args),
}));
jest.mock('./protocol/handleCheckRoom', () => ({
  handleCheckRoom: (...args: unknown[]) => handleCheckRoom(...args),
}));

import { configureSocketServer } from './socket-config';

type ServerHandle = {
  ioServer: IOServer;
  close: () => Promise<void>;
  port: number;
};

async function startServer(): Promise<ServerHandle> {
  const httpServer = createServer();
  const ioServer = await configureSocketServer(httpServer);

  await new Promise<void>((resolve) => {
    httpServer.listen(0, '127.0.0.1', () => resolve());
  });

  const { port } = httpServer.address() as AddressInfo;

  return {
    ioServer,
    port,
    close: async () => {
      // socket.io's `Server.close` also closes the underlying http
      // server, so we don't call httpServer.close() separately.
      await new Promise<void>((resolve) => {
        ioServer.close(() => resolve());
      });
    },
  };
}

function connectClient(port: number): Promise<ClientSocket> {
  return new Promise((resolve, reject) => {
    const client = ioClient(`http://127.0.0.1:${port}`, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });
    client.on('connect', () => resolve(client));
    client.on('connect_error', reject);
  });
}

async function settle() {
  // Wait long enough for the server to process the emitted event.
  await new Promise((resolve) => setTimeout(resolve, 50));
}

describe('socket-config room-membership guards (HackerOne 3604630)', () => {
  let handle: ServerHandle | undefined;
  let client: ClientSocket | undefined;

  beforeEach(async () => {
    jest.clearAllMocks();
    handle = await startServer();
  });

  afterEach(async () => {
    client?.disconnect();
    client = undefined;
    if (handle) {
      await handle.close();
      handle = undefined;
    }
  });

  it('blocks ping from a socket that has not joined the channel room', async () => {
    if (!handle) {
      throw new Error('server not initialised');
    }
    const channelId = uuidv4();
    client = await connectClient(handle.port);

    client.emit(
      'ping',
      { id: channelId, clientType: 'dapp' },
      () => undefined,
    );
    await settle();

    expect(handlePing).not.toHaveBeenCalled();
  });

  it('blocks ack from a socket that has not joined the channel room', async () => {
    if (!handle) {
      throw new Error('server not initialised');
    }
    const channelId = uuidv4();
    client = await connectClient(handle.port);

    client.emit('ack', {
      channelId,
      ackId: uuidv4(),
      clientType: 'dapp',
    });
    await settle();

    expect(handleAck).not.toHaveBeenCalled();
  });

  it('blocks message from a socket that has not joined the channel room', async () => {
    if (!handle) {
      throw new Error('server not initialised');
    }
    const channelId = uuidv4();
    client = await connectClient(handle.port);

    client.emit(
      'message',
      {
        id: channelId,
        message: 'encrypted',
        context: 'dapp',
        clientType: 'dapp',
        plaintext: '',
      },
      () => undefined,
    );
    await settle();

    expect(handleMessage).not.toHaveBeenCalled();
  });

  it('forwards ping and ack to the protocol handlers when the socket is in the channel room', async () => {
    if (!handle) {
      throw new Error('server not initialised');
    }
    const channelId = uuidv4();
    client = await connectClient(handle.port);

    // Move the corresponding server-side socket into the channel room
    // directly (bypassing the mocked join_channel handler) so we can
    // verify the positive case for both guards.
    const sockets = await handle.ioServer.fetchSockets();
    expect(sockets).toHaveLength(1);
    await sockets[0].join(channelId);

    client.emit(
      'ping',
      { id: channelId, clientType: 'dapp' },
      () => undefined,
    );
    client.emit('ack', {
      channelId,
      ackId: uuidv4(),
      clientType: 'dapp',
    });
    await settle();

    expect(handlePing).toHaveBeenCalledTimes(1);
    expect(handleAck).toHaveBeenCalledTimes(1);
  });

  it('still forwards rejected to handleChannelRejected (participant check is inside the handler)', async () => {
    if (!handle) {
      throw new Error('server not initialised');
    }
    const channelId = uuidv4();
    client = await connectClient(handle.port);

    client.emit('rejected', { channelId });
    await settle();

    expect(handleChannelRejected).toHaveBeenCalledTimes(1);
  });
});
