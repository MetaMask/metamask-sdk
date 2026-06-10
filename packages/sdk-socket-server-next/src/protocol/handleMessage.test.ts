/* eslint-disable jsdoc/require-jsdoc */
import { v4 as uuidv4 } from 'uuid';

const mockPubClient = {
  get: jest.fn(),
  set: jest.fn(),
  rpush: jest.fn(),
  expire: jest.fn(),
};

jest.mock('../analytics-api', () => ({
  pubClient: mockPubClient,
}));

jest.mock('../rate-limiter', () => ({
  rateLimiterMessage: { consume: jest.fn().mockResolvedValue(undefined) },
  resetRateLimits: jest.fn(),
  increaseRateLimits: jest.fn(),
  setLastConnectionErrorTimestamp: jest.fn(),
}));

jest.mock('@socket.io/redis-adapter', () => ({
  createAdapter: jest.fn(),
}));

import { handleMessage, MessageParams } from './handleMessage';

type Emit = jest.Mock;

function makeSocket(channelId: string) {
  const broadcastToEmit: Emit = jest.fn();
  const broadcastEmit: Emit = jest.fn();

  const broadcast = {
    to: jest.fn(() => ({ emit: broadcastToEmit })),
    emit: broadcastEmit,
  };

  return {
    socket: {
      id: 'socket-id-1',
      handshake: { address: '127.0.0.1' },
      request: { socket: { remoteAddress: '127.0.0.1' } },
      rooms: new Set([channelId]),
      broadcast,
      emit: jest.fn(),
    } as any,
    broadcastToEmit,
    broadcastEmit,
    broadcastTo: broadcast.to,
  };
}

describe('handleMessage error path', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('scopes the error broadcast to the channel room (regression: HackerOne 3604630)', async () => {
    const channelId = uuidv4();
    const { socket, broadcastTo, broadcastToEmit, broadcastEmit } =
      makeSocket(channelId);

    // Force handleMessage to throw inside its try-block by making
    // pubClient.get reject.
    mockPubClient.get.mockRejectedValueOnce(new Error('boom'));

    const callback = jest.fn();

    const params: MessageParams = {
      io: {} as any,
      socket,
      channelId,
      clientType: 'dapp',
      context: 'dapp',
      message: 'encrypted-string',
      hasRateLimit: false,
      callback,
    };

    await handleMessage(params);

    expect(broadcastTo).toHaveBeenCalledWith(channelId);
    expect(broadcastToEmit).toHaveBeenCalledWith(
      `message-${channelId}`,
      expect.objectContaining({ error: 'boom' }),
    );

    // CRITICAL: error must NOT be broadcast to all sockets (which would
    // leak the active channel ID).
    expect(broadcastEmit).not.toHaveBeenCalled();

    expect(callback).toHaveBeenCalledWith('boom');
  });
});
