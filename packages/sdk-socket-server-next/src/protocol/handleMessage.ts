import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { pubClient } from '../analytics-api';
import { config, isDevelopment } from '../config';
import { getLogger } from '../logger';
import {
  increaseRateLimits,
  rateLimiterMessage,
  resetRateLimits,
  setLastConnectionErrorTimestamp,
} from '../rate-limiter';
import { ClientType, MISSING_CONTEXT } from '../socket-config';
import { ChannelConfig } from './handleJoinChannel';

const logger = getLogger();

export type MessageParams = {
  io: Server;
  socket: Socket;
  channelId: string;
  clientIp?: string;
  clientType?: ClientType;
  context?: string;
  message: string | Record<string, unknown>;
  plaintext?: string;
  hasRateLimit: boolean;
  callback: (error: string | null, result?: unknown) => void;
};

export type QueuedMessage = {
  ackId: string;
  message: string;
  plaintext?: string;
  timestamp: number;
};

export const handleMessage = async ({
  socket,
  channelId,
  context,
  message,
  plaintext,
  clientType,
  hasRateLimit,
  callback,
}: MessageParams) => {
  const socketId = socket.id;
  const clientIp = socket.request.socket.remoteAddress;

  let from: string = context ?? MISSING_CONTEXT;
  if (context?.indexOf('metamask-mobile') !== -1) {
    from = 'wallet';
  } else if (context.indexOf('dapp') !== -1) {
    from = 'dapp';
  }

  let channelConfig: ChannelConfig | null = null;
  let ready = false; // Determines if the keys have been exchanged and both side support the full protocol

  try {
    if (clientType) {
      // new protocol, get channelConfig
      // Force keys into the same hash slot in Redis Cluster, using a hash tag (a substring enclosed in curly braces {})
      const channelConfigKey = `channel_config:{${channelId}}`;
      const existingConfig = await pubClient.get(channelConfigKey);
      channelConfig = existingConfig ? JSON.parse(existingConfig) : null;
      ready = channelConfig?.ready ?? false;
    }

    if (hasRateLimit) {
      await rateLimiterMessage.consume(socket.handshake.address);
    }

    if (hasRateLimit) {
      resetRateLimits();
    }

    let formatted = plaintext;
    const protocol = typeof message === 'object' ? message : '__ENCRYPTED__';
    const encrypted = typeof message === 'string';
    if (isDevelopment && formatted) {
      formatted = JSON.stringify(JSON.parse(plaintext ?? ''), null, 2);
    }

    let keyExchangeAck = false;
    // Check if keys have been exchanged by looking for 'key_handshake_ACK' message in clear
    if (typeof message === 'object') {
      if (channelConfig && message.type === 'key_handshake_ACK') {
        ready = true;
        channelConfig = { ...channelConfig, ready };

        await pubClient.set(
          `channel_config:{${channelId}}`,
          JSON.stringify(channelConfig),
        );

        keyExchangeAck = true;
        // Keep track of it to send the channel config update after the message was sent back
      }
    }

    let ackId: string | undefined;

    logger.info(
      `[handleMessage] clientType: ${clientType} encrypted: ${encrypted} ready: ${ready} `,
      {
        channelId,
        socketId,
        clientIp,
      },
    );

    if (encrypted) {
      ackId = uuidv4();
      // Store in the correct message queue
      const otherQueue = clientType === 'dapp' ? 'wallet' : 'dapp';
      // Force keys into the same hash slot in Redis Cluster, using a hash tag (a substring enclosed in curly braces {})  
      const queueKey = `queue:{${channelId}}:${otherQueue}`;
      const persistedMsg: QueuedMessage = {
        message,
        ackId,
        plaintext: isDevelopment ? formatted : undefined,
        timestamp: Date.now(),
      };
      logger.debug(
        `[handleMessage] persisting message in queue ${queueKey}`,
        persistedMsg,
      );
      await pubClient.rpush(queueKey, JSON.stringify(persistedMsg));
      await pubClient.expire(queueKey, config.msgExpiry);
    }

    logger.debug(
      `[handleMessage] message-${channelId} received from=${from} ready=${ready} clientType=${clientType} ackId=${ackId}`,
      formatted,
      protocol,
    );

    socket.broadcast
      .to(channelId)
      .emit(`message-${channelId}`, { id: channelId, ackId, message });

    // Always emit success response to socket
    callback?.(null, { id: channelId, success: true });

    if (keyExchangeAck && channelConfig?.persistence) {
      logger.debug(
        `[handleMessage] channelConfig updated on channelId=${channelId}`,
        {
          channelId,
          socketId,
          clientIp,
          channelConfig,
        },
      );

      const configUpdate = {
        persistence: true,
        walletKey: channelConfig.walletKey,
      };

      // broadcast that the channel supports relayPersistence
      socket.broadcast.to(channelId).emit(`config-${channelId}`, configUpdate);

      // also inform current client
      socket.emit(`config-${channelId}`, configUpdate);
    }
  } catch (error) {
    setLastConnectionErrorTimestamp(Date.now());
    increaseRateLimits(90);
    logger.error(`[handleMessage] ERROR > Error on message: ${error} `, {
      channelId,
      socketId,
      clientIp,
    });

    // emit an error message back to the client, if appropriate
    socket.broadcast.emit(`message-${channelId}`, {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });

    // Call the callback with the error
    callback(error instanceof Error ? error.message : 'Unknown error occurred');
  }
};
