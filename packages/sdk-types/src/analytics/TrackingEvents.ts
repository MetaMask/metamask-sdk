/**
 * Object defining the names of trackable analytics events within the SDK.
 * Using 'as const' for better type inference and tree-shaking.
 */
export const TrackingEvents = {
  REQUEST: 'sdk_connect_request_started',
  REQUEST_MOBILE: 'sdk_connect_request_started_mobile',
  RECONNECT: 'sdk_reconnect_request_started',
  CONNECTED: 'sdk_connection_established',
  CONNECTED_MOBILE: 'sdk_connection_established_mobile',
  AUTHORIZED: 'sdk_connection_authorized',
  REJECTED: 'sdk_connection_rejected',
  TERMINATED: 'sdk_connection_terminated',
  DISCONNECTED: 'sdk_disconnected',
  SDK_USE_EXTENSION: 'sdk_use_extension',
  SDK_RPC_REQUEST: 'sdk_rpc_request',
  SDK_RPC_REQUEST_RECEIVED: 'sdk_rpc_request_received',
  SDK_RPC_REQUEST_DONE: 'sdk_rpc_request_done',
  SDK_EXTENSION_UTILIZED: 'sdk_extension_utilized',
  SDK_USE_INAPP_BROWSER: 'sdk_use_inapp_browser',
} as const;

/**
 * Union type derived from the values of the TrackingEvents object.
 * Use this type for function parameters or variable annotations
 * where any tracking event value is expected.
 */
export type TrackingEvent =
  (typeof TrackingEvents)[keyof typeof TrackingEvents];
