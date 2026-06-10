/* eslint-disable node/no-process-env */
// Jest setup: ensure required environment variables are present so that
// `analytics-api` does not call `process.exit(1)` when it loads.
process.env.REDIS_NODES =
  process.env.REDIS_NODES ?? 'redis://localhost:6379';
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';

// Some tests mock `./analytics-api` so the side-effectful logger setup in
// `./config` never runs. Initialise the logger here so `getLogger()` returns
// a real winston logger from any module under test.
// eslint-disable-next-line import/no-unassigned-import
import './src/config';
