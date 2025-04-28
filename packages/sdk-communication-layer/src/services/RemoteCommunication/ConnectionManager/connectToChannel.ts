// packages/sdk-communication-layer/src/services/RemoteCommunication/ConnectionManager/connectToChannel.ts
import { analytics } from '@metamask/sdk-analytics';
import { validate } from 'uuid';
import { logger } from '../../../utils/logger';
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
export async function connectToChannel({
  channelId,
  withKeyExchange,
  authorized,
  state,
}: {
  channelId: string;
  authorized?: boolean;
  withKeyExchange?: boolean;
  state: RemoteCommunicationState;
}) {
  if (!validate(channelId)) {
    logger.RemoteCommunication(
      `[RemoteCommunication: connectToChannel()] context=${state.context} invalid channel channelId=${channelId}`,
    );
    throw new Error(`Invalid channel ${channelId}`);
  }

  logger.RemoteCommunication(
    `[RemoteCommunication: connectToChannel()] context=${state.context} channelId=${channelId} withKeyExchange=${withKeyExchange}`,
  );

  if (state.communicationLayer?.isConnected()) {
    // Adding a check on previous connection to prevent reconnecting during dev when HMR is enabled
    logger.RemoteCommunication(
      `[RemoteCommunication: connectToChannel()] context=${state.context} already connected - interrupt connection.`,
    );
    return;
  }

  state.channelId = channelId;
  await state.communicationLayer?.connectToChannel({
    channelId,
    authorized,
    withKeyExchange,
  });
  const newChannelConfig: ChannelConfig = {
    ...state.channelConfig,
    channelId,
    validUntil: Date.now() + state.sessionDuration,
  };
  state.channelConfig = newChannelConfig;
  state.storageManager?.persistChannelConfig(newChannelConfig);

  if (!state.isOriginator) {
    analytics.track('wallet_connection_user_approved', {
      anon_id: state.originatorInfo?.anonId,
    });
  }
}
