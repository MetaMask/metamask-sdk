import { createLogger, setLogger } from './logger';

export const isDevelopment: boolean = process.env.NODE_ENV === 'development';

// Initialize the logger
const logger = createLogger(isDevelopment);
setLogger(logger);

export const REDIS_DEBUG_LOGS: boolean =
  process.env.REDIS_DEBUG_LOGS === 'true';
export const EVENTS_DEBUG_LOGS: boolean =
  process.env.EVENTS_DEBUG_LOGS === 'true';
export const isDevelopmentServer: boolean =
  process.env.ENVIRONMENT === 'development';
export const withAdminUI: boolean = process.env.ADMIN_UI === 'true';

const HOUR_IN_SECONDS = 60 * 60;
const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60; // expiration time of entries in Redis
export const MAX_CLIENTS_PER_ROOM = 2;

export const config = {
  msgExpiry: HOUR_IN_SECONDS,
  channelExpiry: THIRTY_DAYS_IN_SECONDS,
  rejectedChannelExpiry: 5 * 60, // 5min for dapp to fetch the message
};

if (process.env.CHANNEL_EXPIRY) {
  try {
    const _expiry = parseInt(process.env.CHANNEL_EXPIRY, 10);
    if (_expiry > 0) {
      config.channelExpiry = _expiry;
    } else {
      logger.error('CHANNEL_EXPIRY value must be greater than 0');
    }
  } catch (error) {
    logger.error('Invalid CHANNEL_EXPIRY value', process.env.CHANNEL_EXPIRY);
  }
}

if (process.env.MSG_EXPIRY) {
  try {
    const _expiry = parseInt(process.env.MSG_EXPIRY, 10);
    if (_expiry > 0) {
      config.msgExpiry = _expiry;
    } else {
      logger.error('MSG_EXPIRY value must be greater than 0');
    }
  } catch (error) {
    logger.error('Invalid MSG_EXPIRY value', process.env.MSG_EXPIRY);
  }
}

export const hasRateLimit = process.env.RATE_LIMITER === 'true';
export const redisCluster = process.env.REDIS_CLUSTER === 'true';
export const redisTLS = process.env.REDIS_TLS === 'true';
