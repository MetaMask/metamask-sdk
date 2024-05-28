import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { pubClient } from '../api-config';
import { config, isDevelopment } from '../config';
import { logger } from '../logger';
import {
  increaseRateLimits,
  rateLimiterMessage,
  resetRateLimits,
  setLastConnectionErrorTimestamp,
} from '../rate-limiter';
import { ClientType, MISSING_CONTEXT } from '../socket-config';
import { ChannelConfig } from './handleJoinChannel';

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
}: MessageParams) => {
  // const socketId = socket.id;
  // const clientIp = socket.request.socket.remoteAddress;

  let from = context ?? MISSING_CONTEXT;
  if (context?.indexOf('metamask-mobile') !== -1) {
    from = 'wallet';
  } else if (context.indexOf('dapp') !== -1) {
    from = 'dapp';
  }

  let channelConfig: ChannelConfig | null = null;
  let ready = false; // Determines if the keys have been exchanged and both side support the full protocol
  if (clientType) {
    // new protocol, get channelConfig
    const channelConfigKey = `channel_config:${channelId}`;
    const existingConfig = await pubClient.get(channelConfigKey);
    channelConfig = existingConfig ? JSON.parse(existingConfig) : null;
    ready = channelConfig?.ready ?? false;
  }

  try {
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
          `channel_config:${channelId}`,
          JSON.stringify(channelConfig),
        );

        keyExchangeAck = true;
        // Keep track of it to send the channel config update after the message was sent back
      }
    }

    let ackId: string | undefined;

    if (encrypted && ready) {
      ackId = uuidv4();
      // Store in the correct message queue
      const otherQueue = clientType === 'dapp' ? 'wallet' : 'dapp';
      const queueKey = `queue:${channelId}:${otherQueue}`;
      const persistedMsg: QueuedMessage = {
        message,
        ackId,
        timestamp: Date.now(),
      };
      logger.debug(`persisting message in queue ${queueKey}`, persistedMsg);
      await pubClient.rpush(queueKey, JSON.stringify(persistedMsg));
      await pubClient.expire(queueKey, config.msgExpiry);
    }

    logger.info(
      `message-${channelId} received from=${from} ready=${ready} clientType=${clientType} ackId=${ackId}`,
      formatted,
      protocol,
    );

    socket.broadcast
      .to(channelId)
      .emit(`message-${channelId}`, { id: channelId, ackId, message });

    if (keyExchangeAck && channelConfig?.persistence) {
      console.warn(`channelConfig updated`, channelConfig);
      // broadcast that the channel supports relayPersistence
      socket.broadcast
        .to(channelId)
        .emit(`config-${channelId}`, { persistence: true });
      // also inform current client
      socket.emit(`config-${channelId}`, { persistence: true });
    }
    return;
  } catch (error) {
    setLastConnectionErrorTimestamp(Date.now());
    increaseRateLimits(90);
    logger.error(`ERROR > Error on message: ${error} `);
    // emit an error message back to the client, if appropriate
    socket.broadcast.emit(`message-${channelId}`, {
      error: (error as Error).message,
    });
  }
};
