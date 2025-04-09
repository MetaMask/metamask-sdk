import { Server, Socket } from 'socket.io';
import { pubClient, pubClientPool } from '../analytics-api';
import { config } from '../config';
import { getLogger } from '../logger';
import { ChannelConfig } from './handleJoinChannel';

const logger = getLogger();

export type ChannelRejectedParams = {
  io: Server;
  socket: Socket;
  channelId: string;
};

/**
 * Can only be called by the wallet after a connection attempt.
 *
 * @param params
 * @param callback
 */
export const handleChannelRejected = async (
  params: ChannelRejectedParams,
  callback?: (error: string | null, result?: unknown) => void,
) => {
  const { channelId, socket } = params;

  const socketId = socket.id;
  const clientIp = socket.request.socket.remoteAddress;

  // Force keys into the same hash slot in Redis Cluster, using a hash tag (a substring enclosed in curly braces {})
  const channelConfigKey = `channel_config:{${channelId}}`;
  const existingConfig = await pubClient.get(channelConfigKey);
  let channelConfig: ChannelConfig | null = existingConfig
    ? (JSON.parse(existingConfig) as ChannelConfig)
    : null;

  if (channelConfig) {
    logger.debug(
      `[handleChannelRejected] Channel already exists: ${channelId}`,
      JSON.stringify(channelConfig),
    );

    // ignore if already ready
    if (channelConfig.ready) {
      logger.warn(
        `[handleChannelRejected] received rejected for channel that is already ready: ${channelId}`,
        {
          channelId,
          socketId,
          clientIp,
        },
      );
      return;
    }

    // channel config already exists but keyexchange hasn't happened, so we can just update the existing one as rejected with short ttl.
    channelConfig.rejected = true;
    channelConfig.updatedAt = Date.now();
  } else {
    // this condition can occur if the dapp (ios) was disconnected before the channel config was created
    channelConfig = {
      clients: {
        wallet: socketId,
        dapp: '',
      },
      rejected: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  logger.info(
    `[handleChannelRejected] updating channel config for channelId=${channelId}`,
    {
      channelId,
      socketId,
      clientIp,
    },
  );

  const client = await pubClientPool.acquire();

  // Update redis channel config to inform dApp of rejection
  await client.setex(
    channelConfigKey,
    config.rejectedChannelExpiry,
    JSON.stringify(channelConfig),
  );

  await pubClientPool.release(client);

  // Also broadcast to dapp if it is connected
  socket.broadcast.to(channelId).emit(`rejected-${channelId}`, { channelId });

  // Edit redis channel config to set to terminated for sdk to pick up
  callback?.(null, { success: true });
};
