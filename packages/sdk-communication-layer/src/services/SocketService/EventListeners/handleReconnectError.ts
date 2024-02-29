import { logger } from '../../../utils/logger';

/**
 * Returns a handler function to handle the 'reconnect_error' event.
 * This handler logs a debug message indicating a reconnection error and includes the error details.
 *
 * @param error The error object representing the reconnection error.
 * @returns {Function} A handler function for the 'reconnect_error' event.
 */
export function handleReconnectError() {
  return (error: any) => {
    logger.SocketService(
      `[SocketService: handleReconnectError()] on 'reconnect_error'`,
      error,
    );
  };
}
