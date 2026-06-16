/* eslint-disable jsdoc/require-jsdoc */
import { v4 as uuidv4 } from 'uuid';

const mockPubClient = {
  get: jest.fn(),
  setex: jest.fn(),
};

jest.mock('../analytics-api', () => ({
  pubClient: mockPubClient,
}));

jest.mock('@socket.io/redis-adapter', () => ({
  createAdapter: jest.fn(),
}));

import {
  handleChannelRejected,
  ChannelRejectedParams,
} from './handleChannelRejected';
import { ChannelConfig } from './handleJoinChannel';

function makeSocket({
  rooms,
  socketId = 'socket-id-1',
}: {
  rooms: string[];
  socketId?: string;
}) {
  const broadcastToEmit = jest.fn();
  return {
    id: socketId,
    request: { socket: { remoteAddress: '127.0.0.1' } },
    rooms: new Set(rooms),
    broadcast: {
      to: jest.fn(() => ({ emit: broadcastToEmit })),
    },
  } as any;
}

describe('handleChannelRejected participant check (HackerOne 3604630)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects requests from a non-participant socket on a fresh channel', async () => {
    const channelId = uuidv4();
    const socket = makeSocket({ rooms: [] });

    // No existing channelConfig: this is a fresh channelId an attacker is
    // poking at.
    mockPubClient.get.mockResolvedValueOnce(null);

    const callback = jest.fn();
    const params: ChannelRejectedParams = {
      io: {} as any,
      socket,
      channelId,
    };

    await handleChannelRejected(params, callback);

    expect(callback).toHaveBeenCalledWith('not authorized', undefined);
    // Must not write any rejected entry to redis on a non-participant request.
    expect(mockPubClient.setex).not.toHaveBeenCalled();
    expect(socket.broadcast.to).not.toHaveBeenCalled();
  });

  it('rejects requests from a non-participant socket even when a channelConfig with no wallet exists', async () => {
    const channelId = uuidv4();
    const socket = makeSocket({ rooms: [] });

    // Existing config but no wallet recorded yet (e.g. only the dapp has
    // joined). The reconnect-and-reject flow only applies to wallets that
    // had previously joined.
    const existingConfig: ChannelConfig = {
      clients: { dapp: 'dapp-socket-id', wallet: '' },
      createdAt: 1,
      updatedAt: 1,
    };
    mockPubClient.get.mockResolvedValueOnce(JSON.stringify(existingConfig));

    const callback = jest.fn();
    const params: ChannelRejectedParams = {
      io: {} as any,
      socket,
      channelId,
    };

    await handleChannelRejected(params, callback);

    expect(callback).toHaveBeenCalledWith('not authorized', undefined);
    expect(mockPubClient.setex).not.toHaveBeenCalled();
  });

  it('rejects requests with an invalid channelId', async () => {
    const socket = makeSocket({ rooms: [] });
    const callback = jest.fn();
    const params: ChannelRejectedParams = {
      io: {} as any,
      socket,
      channelId: 'not-a-uuid',
    };

    await handleChannelRejected(params, callback);

    expect(callback).toHaveBeenCalledWith('error_id', undefined);
    expect(mockPubClient.get).not.toHaveBeenCalled();
    expect(mockPubClient.setex).not.toHaveBeenCalled();
  });

  it('allows the request when the socket is a live in-room participant', async () => {
    const channelId = uuidv4();
    const socket = makeSocket({ rooms: [channelId] });

    mockPubClient.get.mockResolvedValueOnce(null);
    mockPubClient.setex.mockResolvedValueOnce('OK');

    const callback = jest.fn();
    const params: ChannelRejectedParams = {
      io: {} as any,
      socket,
      channelId,
    };

    await handleChannelRejected(params, callback);

    expect(mockPubClient.setex).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(null, { success: true });
  });

  it('allows the post-reconnect reject flow when channelConfig has a known wallet', async () => {
    const channelId = uuidv4();
    // Wallet has reconnected, so its socket is not in the room.
    const socket = makeSocket({
      rooms: [],
      socketId: 'wallet-reconnected-socket-id',
    });

    const existingConfig: ChannelConfig = {
      clients: {
        wallet: 'previous-wallet-socket-id',
        dapp: 'dapp-socket-id',
      },
      createdAt: 1,
      updatedAt: 1,
    };
    mockPubClient.get.mockResolvedValueOnce(JSON.stringify(existingConfig));
    mockPubClient.setex.mockResolvedValueOnce('OK');

    const callback = jest.fn();
    const params: ChannelRejectedParams = {
      io: {} as any,
      socket,
      channelId,
    };

    await handleChannelRejected(params, callback);

    expect(mockPubClient.setex).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(mockPubClient.setex.mock.calls[0][2]);
    expect(payload.rejected).toBe(true);

    expect(socket.broadcast.to).toHaveBeenCalledWith(channelId);
    expect(callback).toHaveBeenCalledWith(null, { success: true });
  });

  it('does not modify a channel that is already in the ready state', async () => {
    const channelId = uuidv4();
    const socket = makeSocket({ rooms: [channelId] });

    const existingConfig: ChannelConfig = {
      clients: { wallet: 'wallet-id', dapp: 'dapp-id' },
      ready: true,
      createdAt: 1,
      updatedAt: 1,
    };
    mockPubClient.get.mockResolvedValueOnce(JSON.stringify(existingConfig));

    const callback = jest.fn();
    const params: ChannelRejectedParams = {
      io: {} as any,
      socket,
      channelId,
    };

    await handleChannelRejected(params, callback);

    expect(mockPubClient.setex).not.toHaveBeenCalled();
  });
});
