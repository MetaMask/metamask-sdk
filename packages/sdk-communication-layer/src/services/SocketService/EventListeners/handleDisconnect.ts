import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { logger } from '../../../utils/logger';
import { reconnectSocket } from '../ConnectionManager/reconnectSocket';

/**
 * Returns a handler function to handle the 'disconnect' event.
 * This handler checks whether the disconnection was manual or due to other reasons.
 * If it wasn't a manual disconnect, it emits the SOCKET_DISCONNECTED event and attempts to reconnect.
 *
 * @param instance The current instance of the SocketService.
 * @returns {Function} A handler function for the 'disconnect' event.
 */
export function handleDisconnect(instance: SocketService) {
  return (reason: string) => {
    logger.SocketService(
      `[SocketService: handleDisconnect()] on 'disconnect' manualDisconnect=${instance.state.manualDisconnect}`,
      reason,
    );

    if (!instance.state.manualDisconnect) {
      instance.emit(EventType.SOCKET_DISCONNECTED);
      reconnectSocket(instance).catch((err) => {
        console.error(
          `SocketService::handleDisconnect Error reconnecting socket`,
          err,
        );
      });
    }
  };
}
