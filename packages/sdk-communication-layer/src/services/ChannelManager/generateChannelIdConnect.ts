import { RemoteCommunicationState } from '../../RemoteCommunication';
import { clean } from './clean';

export function generateChannelIdConnect(state: RemoteCommunicationState) {
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
      channelId: state.channelId,
      validUntil: Date.now() + state.sessionDuration,
    };
    state.storageManager?.persistChannelConfig(state.channelConfig);

    return {
      channelId: state.channelId,
      pubKey: state.communicationLayer?.getKeyInfo()?.ecies.public,
    };
  }

  if (state.debug) {
    console.debug(`RemoteCommunication::generateChannelId()`);
  }

  clean(state);
  const channel = state.communicationLayer.createChannel();

  if (state.debug) {
    console.debug(
      `RemoteCommunication::generateChannelId() channel created`,
      channel,
    );
  }

  const channelConfig = {
    channelId: channel.channelId,
    validUntil: Date.now() + state.sessionDuration,
  };
  state.channelId = channel.channelId;
  state.channelConfig = channelConfig;
  // save current channel config
  state.storageManager?.persistChannelConfig(channelConfig);

  return { channelId: state.channelId, pubKey: channel.pubKey };
}
