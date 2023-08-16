import { RemoteCommunicationState } from '../../RemoteCommunication';

export async function originatorSessionConnect(
  state: RemoteCommunicationState,
) {
  if (!state.storageManager) {
    if (state.debug) {
      console.debug(
        `RemoteCommunication::connect() no storage manager defined - skip`,
      );
    }
    return undefined;
  }

  const channelConfig = await state.storageManager.getPersistedChannelConfig(
    state.channelId ?? '',
  );
  if (state.debug) {
    console.debug(
      `RemoteCommunication::connect() autoStarted=${state.originatorConnectStarted} channelConfig`,
      channelConfig,
    );
  }

  const connected = state.communicationLayer?.isConnected();
  if (connected) {
    if (state.debug) {
      console.debug(
        `RemoteCommunication::connect() socket already connected - skip`,
      );
    }
    return channelConfig;
  }

  if (channelConfig) {
    const validSession = channelConfig.validUntil > Date.now();

    if (validSession) {
      state.channelConfig = channelConfig;
      state.originatorConnectStarted = true;
      state.channelId = channelConfig?.channelId;
      state.communicationLayer?.connectToChannel({
        channelId: channelConfig.channelId,
        isOriginator: true,
      });
      return channelConfig;
    } else if (state.debug) {
      console.log(`RemoteCommunication::autoConnect Session has expired`);
    }
  }
  state.originatorConnectStarted = false;
  return undefined;
}
