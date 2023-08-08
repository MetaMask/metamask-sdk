const { RateLimiterRedis } = require('rate-limiter-flexible');
const redisClient = require('./redis-connection'); // Import the shared Redis client

const rateLimitPoints = 100; // Number of points (requests) per duration for a general rate limit
const rateLimitMessagePoints = 100; // Number of points (requests) per duration for message rate limit
const durationInSeconds = 1; // Time duration in seconds

// General Rate Limiter
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rlflx',
  points: rateLimitPoints,
  duration: durationInSeconds,
});

// Message-specific Rate Limiter
const rateLimiterMessage = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rlflx_message',
  points: rateLimitMessagePoints,
  duration: durationInSeconds,
});

module.exports = {
  rateLimiter,
  rateLimiterMessage,
};
