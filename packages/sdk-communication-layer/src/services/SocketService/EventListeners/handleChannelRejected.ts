import { SocketService } from '../../../SocketService';
import { ConnectionStatus } from '../../../types/ConnectionStatus';
import { EventType } from '../../../types/EventType';
import { logger } from '../../../utils/logger';

/**
 * Returns an asynchronous handler function to handle the 'reject' event for a specific channel.
 *
 * @param instance The current instance of the SocketService.
 * @param channelId The ID of the channel associated with the handler.
 * @returns {Function} An asynchronous handler function for the 'clients_connected' event.
 */
export function handleChannelRejected(
  instance: SocketService,
  channelId: string,
) {
  return async (_id: string) => {
    // Only valid if connection hasn't been ready
    if (!instance.state.isOriginator || instance.remote.state.ready) {
      logger.SocketService(
        `[SocketService: handleChannelRejected()] SKIP -- channelId=${channelId} isOriginator=${instance.state.isOriginator} ready=${instance.remote.state.ready}`,
      );
      return;
    }

    logger.SocketService(
      `[SocketService: handleChannelRejected()] context=${instance.state.context} channelId=${channelId} isOriginator=${instance.state.isOriginator} ready=${instance.remote.state.ready}`,
    );

    // Terminate the channel
    instance.remote.disconnect({ terminate: true });
    instance.remote.emit(EventType.REJECTED, { channelId });
    instance.remote.setConnectionStatus(ConnectionStatus.DISCONNECTED);
  };
}
