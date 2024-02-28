import { loggerServiceLayer } from '../../../utils/logger';

/**
 * Returns a handler function to handle the 'ping' event.
 * This handler logs a debug message when a 'ping' event is received.
 *
 * @returns {Function} A handler function for the 'ping' event.
 */
export function handlePing() {
  return () => {
    loggerServiceLayer(`[SocketService: handlePing()] on 'ping'`);
  };
}
