import { SocketService } from '../../../SocketService';

/**
 * Returns a handler function to handle the 'reconnect_failed' event.
 * This handler logs a debug message indicating that reconnection attempts have failed.
 *
 * @param instance The current instance of the SocketService.
 * @returns {Function} A handler function for the 'reconnect_failed' event.
 */
export function handleReconnectFailed(instance: SocketService) {
  return () => {
    if (instance.state.debug) {
      console.debug(`SocketService::on 'reconnect_failed'`);
    }
  };
}
