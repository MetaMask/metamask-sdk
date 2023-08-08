const Redis = require('ioredis');

const redisClient = new Redis({
  host: 'redis',
  port: 6379,
  enableOfflineQueue: false,
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

process.on('exit', () => {
  redisClient.quit();
});

module.exports = redisClient;
