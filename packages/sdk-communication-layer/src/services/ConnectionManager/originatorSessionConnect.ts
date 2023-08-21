import { RemoteCommunication } from '../../RemoteCommunication';

export async function originatorSessionConnect(instace: RemoteCommunication) {
  if (!instace.state.storageManager) {
    if (instace.state.debug) {
      console.debug(
        `RemoteCommunication::connect() no storage manager defined - skip`,
      );
    }
    return undefined;
  }

  const channelConfig =
    await instace.state.storageManager.getPersistedChannelConfig(
      instace.state.channelId ?? '',
    );
  if (instace.state.debug) {
    console.debug(
      `RemoteCommunication::connect() autoStarted=${instace.state.originatorConnectStarted} channelConfig`,
      channelConfig,
    );
  }

  const connected = instace.state.communicationLayer?.isConnected();
  if (connected) {
    if (instace.state.debug) {
      console.debug(
        `RemoteCommunication::connect() socket already connected - skip`,
      );
    }
    return channelConfig;
  }

  if (channelConfig) {
    const validSession = channelConfig.validUntil > Date.now();

    if (validSession) {
      instace.state.channelConfig = channelConfig;
      instace.state.originatorConnectStarted = true;
      instace.state.channelId = channelConfig?.channelId;
      instace.state.communicationLayer?.connectToChannel({
        channelId: channelConfig.channelId,
        isOriginator: true,
      });
      return channelConfig;
    } else if (instace.state.debug) {
      console.log(`RemoteCommunication::autoConnect Session has expired`);
    }
  }
  instace.state.originatorConnectStarted = false;
  return undefined;
}
