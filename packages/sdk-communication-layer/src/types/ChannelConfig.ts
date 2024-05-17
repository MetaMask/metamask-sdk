export interface ChannelConfig {
  channelId: string;
  validUntil: number;
  otherKey?: string;
  localKey?: string;
  relayPersistence?: boolean; // Set if the session has full relay persistence (can exchange message without the other side connected)
  /**
   * lastActive: ms value of the last time connection was ready CLIENTS_READY event.
   * */
  lastActive?: number;
}
