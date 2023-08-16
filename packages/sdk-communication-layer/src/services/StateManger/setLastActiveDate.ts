import { RemoteCommunicationState } from '../../RemoteCommunication';
import { ChannelConfig } from '../../types/ChannelConfig';

export function setLastActiveDate(
  state: RemoteCommunicationState,
  lastActiveDate: Date,
) {
  if (state.debug) {
    console.debug(
      `RemoteCommunication::setLastActiveDate() channel=${state.channelId}`,
      lastActiveDate,
    );
  }
  const newChannelConfig: ChannelConfig = {
    channelId: state.channelId ?? '',
    validUntil: state.channelConfig?.validUntil ?? 0,
    lastActive: lastActiveDate.getTime(),
  };
  state.storageManager?.persistChannelConfig(newChannelConfig);
}
