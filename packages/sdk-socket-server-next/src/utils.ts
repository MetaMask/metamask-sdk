import { Server as HttpServer } from 'http';
import { getLogger } from './logger';
import { getGlobalRedisClient, pubClientPool } from './redis';

const logger = getLogger();

export type FlushResponse = {
  batch: any;
  timestamp: string;
  sentAt: string;
};

export type Analytics = {
  flush(callback: (err: Error | null) => void): Promise<FlushResponse>;
};

export const flushAnalytics = async (
  analytics: Analytics,
): Promise<FlushResponse | Error> => {
  try {
    const flushResponse = await analytics.flush((err) => {
      if (err) {
        throw err;
      }
    });
    return flushResponse;
  } catch (error) {
    return error as Error | FlushResponse;
  }
};

type Server = HttpServer;

export const closeServer = (server: Server): Promise<void> => {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

let isShuttingDown = false;

export const setIsShuttingDown = (value: boolean) => {
  isShuttingDown = value;
};

export const getIsShuttingDown = () => isShuttingDown;

export const cleanupAndExit = async (server: Server): Promise<void> => {
  if (isShuttingDown) {
    logger.info(`cleanupAndExit already in progress`);
    return;
  }
  isShuttingDown = true;

  try {
    logger.info('Starting server cleanup...');
    // CloseServer will block until all clients have disconnected.
    await closeServer(server);
    logger.info(`HTTP server closed.`);

    logger.info('Draining Redis connection pool...');
    await pubClientPool.drain();
    logger.info('Redis connection pool drained.');
    await pubClientPool.clear();
    logger.info('Redis connection pool cleared.');

    const globalRedisClient = getGlobalRedisClient();
    if (globalRedisClient && globalRedisClient.status === 'ready') {
      logger.info('Disconnecting global Redis client...');
      await globalRedisClient.quit();
      logger.info('Global Redis client disconnected.');
    }
  } catch (error) {
    logger.error(`Error during cleanup: ${error}`);
  } finally {
    logger.info(`Cleanup finished. Exiting process.`);
    process.exit(0);
  }
};

export type ChannelInfo = {
  url: string;
  title: string;
  platform: string;
  source: string;
  sdkVersion: string;
  dappId: string;
};

export const extractChannelInfo = (
  body: Record<string, unknown>,
): ChannelInfo | null => {
  const topLevelInfo: Partial<ChannelInfo> = {
    url: typeof body.url === 'string' ? body.url : undefined,
    title: typeof body.title === 'string' ? body.title : undefined,
    platform: typeof body.platform === 'string' ? body.platform : undefined,
    source: typeof body.source === 'string' ? body.source : undefined,
    sdkVersion:
      typeof body.sdkVersion === 'string' ? body.sdkVersion : undefined,
    dappId: typeof body.dappId === 'string' ? body.dappId : undefined,
  };

  const nestedInfo = (body.originationInfo || body.originatorInfo) as
    | Partial<ChannelInfo>
    | undefined;

  const mergedInfo: ChannelInfo = {
    url: topLevelInfo.url || nestedInfo?.url || '',
    title: topLevelInfo.title || nestedInfo?.title || '',
    platform: topLevelInfo.platform || nestedInfo?.platform || '',
    source: topLevelInfo.source || nestedInfo?.source || '',
    sdkVersion: topLevelInfo.sdkVersion || nestedInfo?.sdkVersion || '',
    dappId:
      topLevelInfo.dappId ||
      nestedInfo?.dappId ||
      topLevelInfo.url ||
      nestedInfo?.url ||
      'UNKNOWN-server', // should never happen but keep as identifier if it does
  };

  return mergedInfo;
};

export const isValidEventBody = (
  body: Record<string, unknown>,
): body is {
  event: string;
  id: string;
  params?: Record<string, unknown>;
} & ChannelInfo => {
  if (typeof body.event !== 'string' || typeof body.id !== 'string') {
    return false;
  }

  const channelInfo = extractChannelInfo(body);
  return channelInfo !== null;
};
