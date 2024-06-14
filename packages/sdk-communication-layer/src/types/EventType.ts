export enum EventType {
  // emitted everytime the current step is updated
  KEY_INFO = 'key_info',
  SERVICE_STATUS = 'service_status',
  PROVIDER_UPDATE = 'provider_update',
  RPC_UPDATE = 'rpc_update',
  KEYS_EXCHANGED = 'keys_exchanged',
  JOIN_CHANNEL = 'join_channel',
  CHANNEL_CREATED = 'channel_created',
  CLIENTS_CONNECTED = 'clients_connected',
  CLIENTS_DISCONNECTED = 'clients_disconnected',
  CLIENTS_WAITING = 'clients_waiting',
  CLIENTS_READY = 'clients_ready',
  CHANNEL_PERSISTENCE = 'channel_persistence',
  MESSAGE_ACK = 'ack',
  SOCKET_DISCONNECTED = 'socket_disconnected',
  // socket reconnect should only happen on ios mobile
  SOCKET_RECONNECT = 'socket_reconnect',
  OTP = 'otp',
  // used to trigger RPC call from comm layer, usually only used for backward compatibility
  SDK_RPC_CALL = 'sdk_rpc_call',
  // event emitted when the connection is authorized on the wallet.
  AUTHORIZED = 'authorized',
  CONNECTION_STATUS = 'connection_status',
  MESSAGE = 'message',
  TERMINATE = 'terminate',
}
