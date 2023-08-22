import { RemoteCommunicationState } from '../../RemoteCommunication';
import { clean } from './clean';

/**
 * Generates a new channel ID for the communication layer or reuses an existing one.
 * Also establishes necessary configurations and throws errors if the layer isn't initialized or if the channel is already connected.
 *
 * @param state Current state of the RemoteCommunication class instance.
 * @returns An object containing the channelId and its corresponding public key.
 */

export function generateChannelIdConnect(state: RemoteCommunicationState) {
  const {
    debug,
    sessionDuration,
    storageManager,
    communicationLayer,
    ready,
    channelId,
  } = state;
  if (!communicationLayer) {
    throw new Error('communication layer not initialized');
  }

  if (ready) {
    throw new Error('Channel already connected');
  }

  if (channelId && communicationLayer?.isConnected()) {
    console.warn(
      `Channel already exists -- interrupt generateChannelId`,
      state.channelConfig,
    );

    state.channelConfig = {
      channelId,
      validUntil: Date.now() + sessionDuration,
    };
    storageManager?.persistChannelConfig(state.channelConfig);

    return {
      channelId,
      pubKey: communicationLayer?.getKeyInfo()?.ecies.public,
    };
  }

  if (debug) {
    console.debug(`RemoteCommunication::generateChannelId()`);
  }

  clean(state);
  const channel = communicationLayer.createChannel();

  if (debug) {
    console.debug(
      `RemoteCommunication::generateChannelId() channel created`,
      channel,
    );
  }

  const channelConfig = {
    channelId: channel.channelId,
    validUntil: Date.now() + sessionDuration,
  };
  state.channelId = channel.channelId;
  state.channelConfig = channelConfig;
  // save current channel config
  storageManager?.persistChannelConfig(channelConfig);

  return { channelId, pubKey: channel.pubKey };
}
