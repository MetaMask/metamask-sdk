const Redis = require('ioredis');

// eslint-disable-next-line node/no-process-env
const redisHost = process.env.REDIS_SERVER_HOST || 'redis';
// eslint-disable-next-line node/no-process-env
const redisPort = process.env.REDIS_SERVER_PORT || 6379;

const redisClient = new Redis({
  host: redisHost,
  port: redisPort,
  enableOfflineQueue: false,
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

process.on('exit', () => {
  redisClient.quit();
});

module.exports = redisClient;
