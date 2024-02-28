import { loggerServiceLayer } from '../../../utils/logger';
import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { checkFocusAndReconnect } from '../ConnectionManager';

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
    loggerServiceLayer(
      `[SocketService: handleDisconnect()] on 'disconnect' manualDisconnect=${instance.state.manualDisconnect}`,
      reason,
    );

    if (!instance.state.manualDisconnect) {
      /**
       * Used for web in case of socket io disconnection.
       * Always try to recover the connection.
       *
       * 'disconnect' event also happens on RN after app is in background for ~30seconds.
       * The reason is will be 'transport error'.
       * instance creates an issue that the user needs to reply a provider query within 30 seconds.
       *
       * FIXME: is there a way to address a slow (>30s) provider query reply.
       */
      instance.emit(EventType.SOCKET_DISCONNECTED);
      checkFocusAndReconnect(instance);
    }
  };
}
