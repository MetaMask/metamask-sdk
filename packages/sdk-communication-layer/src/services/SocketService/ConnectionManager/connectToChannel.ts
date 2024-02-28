import { loggerServiceLayer } from '../../../utils/logger';
import { SocketService } from '../../../SocketService';
import { ConnectToChannelOptions } from '../../../types/ConnectToChannelOptions';
import { EventType } from '../../../types/EventType';
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
  const { channelId, withKeyExchange, isOriginator } = options;

  loggerServiceLayer(
    `[SocketService: connectToChannel()] context=${instance.state.context} channelId=${channelId} isOriginator=${isOriginator}`,
    instance.state.keyExchange?.toString(),
  );

  if (instance.state.socket?.connected) {
    throw new Error(`socket already connected`);
  }

  instance.state.manualDisconnect = false;
  instance.state.socket?.connect();
  instance.state.withKeyExchange = withKeyExchange;
  instance.state.isOriginator = isOriginator;
  instance.state.channelId = channelId;
  setupChannelListeners(instance, channelId);
  instance.state.socket?.emit(
    EventType.JOIN_CHANNEL,
    channelId,
    `${instance.state.context}_connectToChannel`,
  );
}
