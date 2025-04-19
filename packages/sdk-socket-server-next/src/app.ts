import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import packageJson from '../package.json';
import { hasRateLimit } from './config';
import { getLogger } from './logger';
import { analyticsRedirectMiddleware } from './middleware-analytics-redirect';
import { readMetrics } from './metrics';

const logger = getLogger();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());
app.use(helmet());
app.disable('x-powered-by');

if (hasRateLimit) {
  // Conditionally apply the rate limiting middleware to all requests.
  let windowMin = 1; // every 1minute
  try {
    if (process.env.RATE_LIMITER_HTTP_WINDOW_MINUTE) {
      windowMin = parseInt(process.env.RATE_LIMITER_HTTP_WINDOW_MINUTE, 10);
    }
  } catch (error) {
    logger.error('Error parsing RATE_LIMITER_HTTP_WINDOW_MINUTE', error);
    // Ignore parsing errors, default to 1 min
  }

  let limit = 100_000; // 100,000 requests per minute by default (effectively unlimited)
  try {
    if (process.env.RATE_LIMITER_HTTP_LIMIT) {
      limit = parseInt(process.env.RATE_LIMITER_HTTP_LIMIT, 10);
    }
  } catch (error) {
    logger.error('Error parsing RATE_LIMITER_HTTP_LIMIT', error);
    // Ignore parsing errors, default to 100k
  }

  const limiterConfig = {
    windowMs: windowMin * 60 * 1000,
    limit,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // store: ... , // Use an external store for consistency across multiple server instances.
  };
  const limiter = rateLimit(limiterConfig);

  logger.info('Rate limiter enabled', limiterConfig);
  app.use(limiter);
}

// Basic Routes (moved from index.ts)
// Make sure to protect the endpoint to be only available within the cluster for prometheus
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(await readMetrics());
});

app.get('/version', (_req, res) => {
  res.send({ version: packageJson.version });
});

// Health check moved from analytics-api.ts (now handled by redirect middleware effectively)
app.get('/', (_req, res) => {
  res.json({ success: true, message: 'Socket server is running' });
});

// Analytics Redirect Middleware
app.use(analyticsRedirectMiddleware);

export { app };
