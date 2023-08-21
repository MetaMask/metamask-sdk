import { RemoteCommunication } from '../../RemoteCommunication';
import { ChannelConfig } from '../../types/ChannelConfig';

export function setLastActiveDate(
  instance: RemoteCommunication,
  lastActiveDate: Date,
) {
  if (instance.state.debug) {
    console.debug(
      `RemoteCommunication::setLastActiveDate() channel=${instance.state.channelId}`,
      lastActiveDate,
    );
  }
  const newChannelConfig: ChannelConfig = {
    channelId: instance.state.channelId ?? '',
    validUntil: instance.state.channelConfig?.validUntil ?? 0,
    lastActive: lastActiveDate.getTime(),
  };
  instance.state.storageManager?.persistChannelConfig(newChannelConfig);
}
