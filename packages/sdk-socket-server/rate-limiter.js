/* eslint-disable node/no-process-env */
require('dotenv').config();
const os = require('os');
const { RateLimiterMemory } = require('rate-limiter-flexible');

let rateLimitPoints = process.env.RATE_LIMIT_POINTS_MAX;
let rateLimitMessagePoints = process.env.RATE_LIMIT_MESSAGE_POINTS_MAX;
const rateLimitPointsMax = process.env.RATE_LIMIT_POINTS_MAX || 100;
const rateLimitMessagePointsMax =
  process.env.RATE_LIMIT_MESSAGE_POINTS_MAX || 1000;
let lastConnectionErrorTimestamp;

// Store the initial values
const initialRateLimitPoints = rateLimitPoints;
const initialRateLimitMessagePoints = rateLimitMessagePoints;

// Create the rate limiters with initial points
let rateLimiter = new RateLimiterMemory({
  points: rateLimitPoints,
  duration: 1,
});

let rateLimiterMesssage = new RateLimiterMemory({
  points: rateLimitMessagePoints,
  duration: 1,
});

const setLastConnectionErrorTimestamp = (timestamp) => {
  lastConnectionErrorTimestamp = timestamp;
};

const resetRateLimits = () => {
  const tenSecondsPassedSinceLastError =
    lastConnectionErrorTimestamp &&
    Date.now() - lastConnectionErrorTimestamp >= 10000;

  if (tenSecondsPassedSinceLastError) {
    // Reset the rate limits to their initial values
    rateLimitPoints = initialRateLimitPoints;
    rateLimitMessagePoints = initialRateLimitMessagePoints;
  }

  console.log(
    `INFO> RL points: ${rateLimitPoints} - RL message points: ${rateLimitMessagePoints}`,
  );
};

const increaseRateLimits = (
  cpuUsagePercentMin,
  // freeMemoryPercentMin
) => {
  // Check the CPU usage
  const cpuLoad = os.loadavg()[0]; // 1 minute load average
  const numCpus = os.cpus().length;
  const cpuUsagePercent = (cpuLoad / numCpus) * 100;

  // Check the memory usage
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const memoryUsagePercent = ((totalMemory - freeMemory) / totalMemory) * 100;
  const freeMemoryPercent = 100 - memoryUsagePercent;

  console.log(
    `INFO> CPU usage: ${cpuUsagePercent}% - Free memory: ${freeMemoryPercent}%`,
  );

  // If CPU is not at 100% and there is at least 10% of free memory
  if (
    cpuUsagePercent <= cpuUsagePercentMin
    // && freeMemoryPercent >= freeMemoryPercentMin
  ) {
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

  rateLimiterMesssage = new RateLimiterMemory({
    points: rateLimitMessagePoints,
    duration: 1,
  });

  console.log(
    `INFO> RL points: ${rateLimitPoints} - RL message points: ${rateLimitMessagePoints}`,
  );
};

module.exports = {
  rateLimiter,
  rateLimiterMesssage,
  resetRateLimits,
  increaseRateLimits,
  setLastConnectionErrorTimestamp,
};
