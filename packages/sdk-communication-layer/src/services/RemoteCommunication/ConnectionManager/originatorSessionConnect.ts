import { logger } from '../../../utils/logger';
import { RemoteCommunication } from '../../../RemoteCommunication';

/**
 * Attempts to establish a session connection for an originator based on stored channel configuration.
 * If a storage manager is defined for the given RemoteCommunication instance, this function will retrieve the persisted channel configuration. Based on the configuration and the current state of the communication layer, various actions are taken:
 * - If the socket is already connected, it skips further actions and returns the channel configuration.
 * - If the stored channel configuration is valid (i.e., not expired), the function sets up the necessary state variables and attempts to connect to the channel.
 *
 * This function is particularly useful for re-establishing connections with saved session configurations.
 *
 * @param instance The current instance of the RemoteCommunication class.
 * @returns The channel configuration if available and valid, otherwise undefined.
 */
export async function originatorSessionConnect(instance: RemoteCommunication) {
  const { state } = instance;

  if (!state.storageManager) {
    logger.RemoteCommunication(
      `[RemoteCommunication: originatorSessionConnect()] no storage manager defined - skip`,
    );
    return undefined;
  }

  const channelConfig = await state.storageManager.getPersistedChannelConfig(
    state.channelId ?? '',
  );
  logger.RemoteCommunication(
    `[RemoteCommunication: originatorSessionConnect()] autoStarted=${state.originatorConnectStarted} channelConfig`,
    channelConfig,
  );

  const connected = state.communicationLayer?.isConnected();
  if (connected) {
    logger.RemoteCommunication(
      `[RemoteCommunication: originatorSessionConnect()] socket already connected - skip`,
    );

    return channelConfig;
  }

  if (channelConfig) {
    const validSession = channelConfig.validUntil > Date.now();

    if (validSession) {
      state.channelConfig = channelConfig;
      state.originatorConnectStarted = true;
      state.channelId = channelConfig?.channelId;
      state.reconnection = true;
      return channelConfig;
    }

    logger.RemoteCommunication(
      `[RemoteCommunication: autoConnect()] Session has expired`,
    );
  }
  state.originatorConnectStarted = false;
  return undefined;
}
