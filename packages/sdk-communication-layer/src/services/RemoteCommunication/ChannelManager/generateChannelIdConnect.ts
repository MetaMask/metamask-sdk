import { RemoteCommunicationState } from '../../../RemoteCommunication';
import { ChannelConfig } from '../../../types/ChannelConfig';
import { logger } from '../../../utils/logger';

/**
 * Generates a new channel ID for the communication layer or reuses an existing one.
 * Also establishes necessary configurations and throws errors if the layer isn't initialized or if the channel is already connected.
 *
 * @param state Current state of the RemoteCommunication class instance.
 * @returns An object containing the channelId and its corresponding public/private key.
 */

export async function generateChannelIdConnect(
  state: RemoteCommunicationState,
) {
  if (!state.communicationLayer) {
    throw new Error('communication layer not initialized');
  }

  if (state.ready) {
    throw new Error('Channel already connected');
  }

  if (state.channelId && state.communicationLayer?.isConnected()) {
    console.warn(
      `Channel already exists -- interrupt generateChannelId`,
      state.channelConfig,
    );

    state.channelConfig = {
      ...state.channelConfig,
      channelId: state.channelId,
      validUntil: Date.now() + state.sessionDuration,
    };

    state.storageManager?.persistChannelConfig(state.channelConfig);

    return {
      channelId: state.channelId,
      privKey: state.communicationLayer?.getKeyInfo()?.ecies.private,
      pubKey: state.communicationLayer?.getKeyInfo()?.ecies.public,
    };
  }

  logger.RemoteCommunication(`[RemoteCommunication: generateChannelId()]`);
  const channel = await state.communicationLayer.createChannel();

  logger.RemoteCommunication(
    `[RemoteCommunication: generateChannelId()] channel created`,
    channel,
  );

  const channelConfig: ChannelConfig = {
    ...state.channelConfig,
    channelId: channel.channelId,
    localKey: channel.privKey,
    validUntil: Date.now() + state.sessionDuration,
  };
  state.channelId = channel.channelId;
  state.channelConfig = channelConfig;

  return {
    channelId: state.channelId,
    pubKey: channel.pubKey,
    privKey: channel.privKey,
  };
}
