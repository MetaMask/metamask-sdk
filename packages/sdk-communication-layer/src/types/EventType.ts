export enum EventType {
  // emitted everytime the current step is updated
  KEY_INFO = 'key_info',
  SERVICE_STATUS = 'service_status',
  READY = 'ready',
  PAUSE = 'pause',
  // otp type is sent when a channel needs approval
  OTP = 'OTP',
  KEYS_EXCHANGED = 'keys_exchanged',
  JOIN_CHANNEL = 'join_channel',
  CHANNEL_CREATED = 'channel_created',
  CLIENTS_DISCONNECTED = 'clients_disconnected',
  CLIENTS_WAITING = 'clients_waiting',
  CLIENTS_READY = 'clients_ready',
  CONNECTION_STATUS = 'connection_status',
  MESSAGE = 'message',
}
