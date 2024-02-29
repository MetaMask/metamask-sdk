import { logger } from '../../../utils/logger';

/**
 * Returns a handler function to handle the 'reconnect_failed' event.
 * This handler logs a debug message indicating that reconnection attempts have failed.
 *
 * @returns {Function} A handler function for the 'reconnect_failed' event.
 */
export function handleReconnectFailed() {
  return () => {
    logger.SocketService(
      `[SocketService: handleReconnectFailed()] on 'reconnect_failed'`,
    );
  };
}
