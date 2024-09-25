import { Server as HttpServer } from 'http';
import { getLogger } from './logger';

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

export const cleanupAndExit = async (
  server: Server,
  analytics: Analytics,
): Promise<void> => {
  if (isShuttingDown) {
    logger.info(`cleanupAndExit already in progress`);
    return;
  }
  isShuttingDown = true;

  try {
    const flushAnalyticsResult = await flushAnalytics(analytics);
    logger.info(`flushAnalyticsResult: ${flushAnalyticsResult}`);

    // CloseServer will block until all clients have disconnected.
    const serverCloseResult = await closeServer(server);
    logger.info(`serverCloseResult: ${serverCloseResult}`);

    if ((serverCloseResult as any) instanceof Error) {
      throw new Error(`Error during server shutdown: ${serverCloseResult}`);
    }

    if (flushAnalyticsResult instanceof Error) {
      throw new Error(`Error on exitGracefully: ${flushAnalyticsResult}`);
    }
  } catch (error) {
    logger.error(`cleanupAndExit error: ${error}`);
  } finally {
    logger.info(`cleanupAndExit done`);
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

  if (Object.values(mergedInfo).every((value) => value !== '')) {
    return mergedInfo;
  }

  return null;
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
