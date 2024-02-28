import { loggerServiceLayer } from '../../../utils/logger';

/**
 * Returns a handler function to handle the 'reconnect' event.
 * This handler logs a debug message indicating a reconnection attempt.
 *
 * @param attempt The number of the reconnection attempt.
 * @returns {Function} A handler function for the 'reconnect' event.
 */
export function handleReconnect() {
  return (attempt: number) => {
    loggerServiceLayer(
      `[SocketService: handleReconnect()] on 'reconnect' attempt=${attempt}`,
    );
  };
}
