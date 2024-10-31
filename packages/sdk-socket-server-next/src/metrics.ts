import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
} from 'prom-client';

const register = new Registry();

collectDefaultMetrics({ register });

export async function readMetrics() {
  return await register.metrics();
}

const socketIoServerTotalClients = new Gauge({
  name: 'socket_io_server_total_clients',
  help: 'Total number of connected clients',
  labelNames: [],
  registers: [register],
});

const socketIoServerTotalRooms = new Gauge({
  name: 'socket_io_server_total_rooms',
  help: 'Total number of rooms',
  labelNames: [],
  registers: [register],
});

const analyticsRequestsTotal = new Counter({
  name: 'analytics_requests_total',
  help: 'Total number of requests to the analytics endpoint',
  labelNames: ['status'],
  registers: [register],
});

const analyticsRequestDuration = new Histogram({
  name: 'analytics_request_duration_seconds',
  help: 'Duration of analytics requests',
  labelNames: [],
  buckets: [0.05, 0.1, 0.2, 0.5, 1], // buckets in seconds
  registers: [register],
});

const analyticsEventsTotal = new Counter({
  name: 'analytics_events_total',
  help: 'Total number of analytics events',
  labelNames: [
    'from',
    'with_channel_id',
    'event_name',
    'platform',
    'sdk_version',
  ],
  registers: [register],
});

const analyticsErrors = new Counter({
  name: 'analytics_errors_total',
  help: 'Total number of errors in analytics processing',
  labelNames: ['error_type'],
  registers: [register],
});

const redisCacheOperations = new Counter({
  name: 'redis_cache_operations_total',
  help: 'Total number of Redis cache operations',
  labelNames: ['operation', 'result'],
  registers: [register],
});

export function setSocketIoServerTotalClients(count: number) {
  socketIoServerTotalClients.set(count);
}

export function setSocketIoServerTotalRooms(count: number) {
  socketIoServerTotalRooms.set(count);
}

export function setAnalyticsRequestsTotal(status: number) {
  analyticsRequestsTotal.inc({ status });
}

export function setAnalyticsRequestDuration(duration: number) {
  analyticsRequestDuration.observe(duration);
}

export function incrementAnalyticsEvents(
  from: string,
  withChannelId: boolean,
  eventName: string,
  platform: string,
  sdkVersion: string,
) {
  analyticsEventsTotal.inc({
    from: from,
    with_channel_id: withChannelId ? 'true' : 'false',
    event_name: eventName,
    platform: platform,
    sdk_version: sdkVersion,
  });
}

export function incrementAnalyticsError(errorType: string) {
  analyticsErrors.inc({ error_type: errorType });
}

export function incrementRedisCacheOperation(
  operation: string,
  isHit: boolean,
) {
  redisCacheOperations.inc({ operation, result: isHit ? 'hit' : 'miss' });
}
