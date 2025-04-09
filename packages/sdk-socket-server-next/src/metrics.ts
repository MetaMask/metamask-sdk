import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
  Summary,
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

const createChannelCounter = new Counter({
  name: 'create_channel_total',
  help: 'Total number of create_channel events',
  labelNames: [],
  registers: [register],
});

const createChannelErrorCounter = new Counter({
  name: 'create_channel_error_total',
  help: 'Total number of create_channel errors',
  labelNames: [],
  registers: [register],
});

const ackCounter = new Counter({
  name: 'ack_total',
  help: 'Total number of ack events',
  labelNames: [],
  registers: [register],
});

const ackErrorCounter = new Counter({
  name: 'ack_error_total',
  help: 'Total number of ack errors',
  labelNames: [],
  registers: [register],
});

const messageCounter = new Counter({
  name: 'message_total',
  help: 'Total number of message events',
  labelNames: [],
  registers: [register],
});

const messageErrorCounter = new Counter({
  name: 'message_error_total',
  help: 'Total number of message errors',
  labelNames: [],
  registers: [register],
});

const pingCounter = new Counter({
  name: 'ping_total',
  help: 'Total number of ping events',
  labelNames: [],
  registers: [register],
});

const pingErrorCounter = new Counter({
  name: 'ping_error_total',
  help: 'Total number of ping errors',
  labelNames: [],
  registers: [register],
});

const joinChannelCounter = new Counter({
  name: 'join_channel_total',
  help: 'Total number of join_channel events',
  labelNames: [],
  registers: [register],
});

const joinChannelErrorCounter = new Counter({
  name: 'join_channel_error_total',
  help: 'Total number of join_channel errors',
  labelNames: [],
  registers: [register],
});

const rejectedCounter = new Counter({
  name: 'rejected_total',
  help: 'Total number of rejected events',
  labelNames: [],
  registers: [register],
});

const rejectedErrorCounter = new Counter({
  name: 'rejected_error_total',
  help: 'Total number of rejected errors',
  labelNames: [],
  registers: [register],
});

const leaveChannelCounter = new Counter({
  name: 'leave_channel_total',
  help: 'Total number of leave_channel events',
  labelNames: [],
  registers: [register],
});

const leaveChannelErrorCounter = new Counter({
  name: 'leave_channel_error_total',
  help: 'Total number of leave_channel errors',
  labelNames: [],
  registers: [register],
});

const checkRoomCounter = new Counter({
  name: 'check_room_total',
  help: 'Total number of check_room events',
  labelNames: [],
  registers: [register],
});

const checkRoomErrorCounter = new Counter({
  name: 'check_room_error_total',
  help: 'Total number of check_room errors',
  labelNames: [],
  registers: [register],
});

const createChannelDuration = new Summary({
  name: 'create_channel_duration_milliseconds',
  help: 'Duration of create_channel events in milliseconds',
  labelNames: [],
  percentiles: [0.5, 0.9, 0.99], // Reports median, 90th and 99th percentiles
  registers: [register],
});

const ackDuration = new Summary({
  name: 'ack_duration_milliseconds',
  help: 'Duration of ack events in milliseconds',
  labelNames: [],
  percentiles: [0.5, 0.9, 0.99],
  registers: [register],
});

const messageDuration = new Summary({
  name: 'message_duration_milliseconds',
  help: 'Duration of message events in milliseconds',
  labelNames: [],
  percentiles: [0.5, 0.9, 0.99],
  registers: [register],
});

const pingDuration = new Summary({
  name: 'ping_duration_milliseconds',
  help: 'Duration of ping events in milliseconds',
  labelNames: [],
  percentiles: [0.5, 0.9, 0.99],
  registers: [register],
});

const joinChannelDuration = new Summary({
  name: 'join_channel_duration_milliseconds',
  help: 'Duration of join_channel events in milliseconds',
  labelNames: [],
  percentiles: [0.5, 0.9, 0.99],
  registers: [register],
});

const rejectedDuration = new Summary({
  name: 'rejected_duration_milliseconds',
  help: 'Duration of rejected events in milliseconds',
  labelNames: [],
  percentiles: [0.5, 0.9, 0.99],
  registers: [register],
});

const leaveChannelDuration = new Summary({
  name: 'leave_channel_duration_milliseconds',
  help: 'Duration of leave_channel events in milliseconds',
  labelNames: [],
  percentiles: [0.5, 0.9, 0.99],
  registers: [register],
});

const checkRoomDuration = new Summary({
  name: 'check_room_duration_milliseconds',
  help: 'Duration of check_room events in milliseconds',
  labelNames: [],
  percentiles: [0.5, 0.9, 0.99],
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

export function incrementCreateChannel() {
  createChannelCounter.inc();
}

export function incrementCreateChannelError() {
  createChannelErrorCounter.inc();
}

export function incrementAck() {
  ackCounter.inc();
}

export function incrementAckError() {
  ackErrorCounter.inc();
}

export function incrementMessage() {
  messageCounter.inc();
}

export function incrementMessageError() {
  messageErrorCounter.inc();
}

export function incrementPing() {
  pingCounter.inc();
}

export function incrementPingError() {
  pingErrorCounter.inc();
}

export function incrementJoinChannel() {
  joinChannelCounter.inc();
}

export function incrementJoinChannelError() {
  joinChannelErrorCounter.inc();
}

export function incrementRejected() {
  rejectedCounter.inc();
}

export function incrementRejectedError() {
  rejectedErrorCounter.inc();
}

export function incrementLeaveChannel() {
  leaveChannelCounter.inc();
}

export function incrementLeaveChannelError() {
  leaveChannelErrorCounter.inc();
}

export function incrementCheckRoom() {
  checkRoomCounter.inc();
}

export function incrementCheckRoomError() {
  checkRoomErrorCounter.inc();
}

export function observeCreateChannelDuration(duration: number) {
  createChannelDuration.observe(duration);
}

export function observeAckDuration(duration: number) {
  ackDuration.observe(duration);
}

export function observeMessageDuration(duration: number) {
  messageDuration.observe(duration);
}

export function observePingDuration(duration: number) {
  pingDuration.observe(duration);
}

export function observeJoinChannelDuration(duration: number) {
  joinChannelDuration.observe(duration);
}

export function observeRejectedDuration(duration: number) {
  rejectedDuration.observe(duration);
}

export function observeLeaveChannelDuration(duration: number) {
  leaveChannelDuration.observe(duration);
}

export function observeCheckRoomDuration(duration: number) {
  checkRoomDuration.observe(duration);
}
