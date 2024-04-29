import { SocketService } from '../../../SocketService';
import { ConnectToChannelOptions } from '../../../types/ConnectToChannelOptions';
import { EventType } from '../../../types/EventType';
import { logger } from '../../../utils/logger';
import { setupChannelListeners } from '../ChannelManager';

/**
 * Connects a SocketService instance to a specified channel.
 * If the socket is already connected, an error is thrown.
 * The function sets up listeners for the channel and emits a JOIN_CHANNEL event.
 *
 * @param options The options required to connect to the channel,
 * including the channel ID, whether a key exchange is needed,
 * and if the current instance is the originator.
 * @param instance The current instance of the SocketService.
 * @throws {Error} Throws an error if the socket is already connected.
 */
export function connectToChannel({
  options,
  instance,
}: {
  options: ConnectToChannelOptions;
  instance: SocketService;
}) {
  const { channelId, withKeyExchange } = options;
  const isOriginator = instance.state.isOriginator ?? false;

  logger.SocketService(
    `[SocketService: connectToChannel()] context=${instance.state.context} channelId=${channelId} isOriginator=${isOriginator}`,
    instance.state.keyExchange?.toString(),
  );

  if (instance.state.socket?.connected) {
    console.error(
      `[SocketService: connectToChannel()] socket already connected`,
    );
    throw new Error(`socket already connected`);
  }

  const { channelConfig } = instance.remote.state;

  if (isOriginator && channelConfig?.relayPersistence) {
    if (
      channelConfig.localKey &&
      channelConfig?.localKey?.length > 0 &&
      channelConfig.otherKey &&
      channelConfig?.otherKey?.length > 0
    ) {
      console.warn(`Setting relay persistence`, channelConfig);
      // Update key exchange status with persisted keys
      instance.state.keyExchange?.setRelayPersistence({
        localKey: channelConfig.localKey,
        otherKey: channelConfig.otherKey,
      });
    } else {
      console.warn(`Missing keys in relay persistence`, channelConfig);
    }
  }
  instance.state.manualDisconnect = false;
  instance.state.socket?.connect();
  instance.state.withKeyExchange = withKeyExchange;
  instance.state.isOriginator = isOriginator;
  instance.state.channelId = channelId;
  setupChannelListeners(instance, channelId);
  instance.state.socket?.emit(
    EventType.JOIN_CHANNEL,
    {
      channelId,
      context: `${instance.state.context}_connectToChannel`,
      clientType: isOriginator ? 'dapp' : 'wallet',
    },
    (error: string | null, result?: { ready: boolean }) => {
      if (error === 'error_terminated') {
        instance.emit(EventType.TERMINATE);
      } else if (typeof result === 'object' && result.ready) {
        // check that keys are available first, if not there was an issue with storage
        console.debug(
          `CONNECT_TO_CHANNL Channel config localKey=${channelConfig?.localKey} otherKey=${channelConfig?.otherKey}`,
          channelConfig,
        );

        // Inform that this channel supports full session persistence
        instance.emit(EventType.CHANNEL_PERSISTENCE);
      }
    },
  );
}
