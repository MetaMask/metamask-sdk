import os from 'os';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { logger } from './logger';
import { isDevelopment } from '.';

let rateLimitPoints = 10;
let rateLimitMessagePoints = 100;
const rateLimitPointsMax = 40;
const rateLimitMessagePointsMax = 400;
let lastConnectionErrorTimestamp: number | null = null;

// Store the initial values
const initialRateLimitPoints = rateLimitPoints;
const initialRateLimitMessagePoints = rateLimitMessagePoints;

// Create the rate limiters with initial points
// eslint-disable-next-line import/no-mutable-exports
let rateLimiter = new RateLimiterMemory({
  points: rateLimitPoints,
  duration: 1,
});

// eslint-disable-next-line import/no-mutable-exports
let rateLimiterMessage = new RateLimiterMemory({
  points: rateLimitMessagePoints,
  duration: 1,
});

const setLastConnectionErrorTimestamp = (timestamp: number): void => {
  lastConnectionErrorTimestamp = timestamp;
};

const resetRateLimits = (): void => {
  const tenSecondsPassedSinceLastError =
    lastConnectionErrorTimestamp &&
    Date.now() - lastConnectionErrorTimestamp >= 10000;

  if (tenSecondsPassedSinceLastError) {
    // Reset the rate limits to their initial values
    rateLimitPoints = initialRateLimitPoints;
    rateLimitMessagePoints = initialRateLimitMessagePoints;
  }

  if (isDevelopment) {
    logger.info(
      `DEBUG> RL points: ${rateLimitPoints} - RL message points: ${rateLimitMessagePoints}`,
      { rateLimitPoints, rateLimitMessagePoints },
    );
  }
};

const increaseRateLimits = (cpuUsagePercentMin: number): void => {
  // Check the CPU usage
  const cpuLoad = os.loadavg()[0]; // 1 minute load average
  const numCpus = os.cpus().length;
  const cpuUsagePercent = (cpuLoad / numCpus) * 100;

  // Check the memory usage
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const memoryUsagePercent = ((totalMemory - freeMemory) / totalMemory) * 100;
  const freeMemoryPercent = 100 - memoryUsagePercent;

  logger.info(
    `increase rate limit CPU usage: ${cpuUsagePercent}% - Free memory: ${freeMemoryPercent}%`,
    { cpuUsagePercent, freeMemoryPercent },
  );

  // If CPU is not at 100% and there is at least 10% of free memory
  if (cpuUsagePercent <= cpuUsagePercentMin) {
    // Increase the rate limits by steps of 5 and 10, up to a max of 50 and 500
    rateLimitPoints = Math.min(rateLimitPoints + 5, rateLimitPointsMax);
    rateLimitMessagePoints = Math.min(
      rateLimitMessagePoints + 50,
      rateLimitMessagePointsMax,
    );
  } else {
    // Reduce the rate limits by steps of 5 and 10, down to the initial values
    rateLimitPoints = Math.max(rateLimitPoints - 5, initialRateLimitPoints);
    rateLimitMessagePoints = Math.max(
      rateLimitMessagePoints - 10,
      initialRateLimitMessagePoints,
    );
  }

  // Update the rate limiters
  rateLimiter = new RateLimiterMemory({
    points: rateLimitPoints,
    duration: 1,
  });

  rateLimiterMessage = new RateLimiterMemory({
    points: rateLimitMessagePoints,
    duration: 1,
  });

  if (isDevelopment) {
    logger.info(
      `RL points: ${rateLimitPoints} - RL message points: ${rateLimitMessagePoints}`,
      { rateLimitPoints, rateLimitMessagePoints },
    );
  }
};

export {
  rateLimiter,
  rateLimiterMessage,
  resetRateLimits,
  increaseRateLimits,
  setLastConnectionErrorTimestamp,
};
