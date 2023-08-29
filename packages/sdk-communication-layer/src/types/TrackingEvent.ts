export enum TrackingEvents {
  REQUEST = 'sdk_connect_request_started',
  REQUEST_MOBILE = 'sdk_connect_request_started_mobile',
  RECONNECT = 'sdk_reconnect_request_started',
  CONNECTED = 'sdk_connection_established',
  CONNECTED_MOBILE = 'sdk_connection_established_mobile',
  AUTHORIZED = 'sdk_connection_authorized',
  REJECTED = 'sdk_connection_rejected',
  TERMINATED = 'sdk_connection_terminated',
  DISCONNECTED = 'sdk_disconnected',
  SDK_USE_EXTENSION = 'sdk_use_extension',
  SDK_USE_INAPP_BROWSER = 'sdk_use_inapp_browser',
}
