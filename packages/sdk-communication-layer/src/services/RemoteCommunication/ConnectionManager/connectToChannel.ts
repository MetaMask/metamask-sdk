import { validate } from 'uuid';
import { RemoteCommunicationState } from '../../../RemoteCommunication';
import { ChannelConfig } from '../../../types/ChannelConfig';

/**
 * Initiates a connection to a specified channel. Validates the channel ID, establishes a new connection if not connected, and sets necessary configurations.
 * Also persists the new channel configuration if a storage manager is available.
 *
 * @param channelId Unique identifier for the channel.
 * @param withKeyExchange Optional flag indicating if key exchange should occur during the connection process.
 * @param state Current state of the RemoteCommunication class instance.
 * @returns void
 */
export function connectToChannel({
  channelId,
  withKeyExchange,
  state,
}: {
  channelId: string;
  withKeyExchange?: boolean;
  state: RemoteCommunicationState;
}) {
  if (!validate(channelId)) {
    console.debug(
      `RemoteCommunication::${state.context}::connectToChannel() invalid channel channelId=${channelId}`,
    );
    throw new Error(`Invalid channel ${channelId}`);
  }

  if (state.debug) {
    console.debug(
      `RemoteCommunication::${state.context}::connectToChannel() channelId=${channelId}`,
    );
  }

  if (state.communicationLayer?.isConnected()) {
    // Adding a check on previous connection to prevent reconnecting during dev when HMR is enabled
    console.debug(
      `RemoteCommunication::${state.context}::connectToChannel() already connected - interrup connection.`,
    );
    return;
  }

  state.channelId = channelId;
  state.communicationLayer?.connectToChannel({
    channelId,
    withKeyExchange,
  });
  const newChannelConfig: ChannelConfig = {
    channelId,
    validUntil: Date.now() + state.sessionDuration,
  };
  state.channelConfig = newChannelConfig;
  state.storageManager?.persistChannelConfig(newChannelConfig);
}
