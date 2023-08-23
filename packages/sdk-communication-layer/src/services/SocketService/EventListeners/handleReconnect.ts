import { SocketService } from '../../../SocketService';

/**
 * Returns a handler function to handle the 'reconnect' event.
 * This handler logs a debug message indicating a reconnection attempt.
 *
 * @param instance The current instance of the SocketService.
 * @param attempt The number of the reconnection attempt.
 * @returns {Function} A handler function for the 'reconnect' event.
 */
export function handleReconnect(instance: SocketService) {
  return (attempt: number) => {
    if (instance.state.debug) {
      console.debug(`SocketService::on 'reconnect' attempt=${attempt}`);
    }
  };
}
