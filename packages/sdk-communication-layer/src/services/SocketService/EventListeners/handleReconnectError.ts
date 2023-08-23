import { SocketService } from '../../../SocketService';

/**
 * Returns a handler function to handle the 'reconnect_error' event.
 * This handler logs a debug message indicating a reconnection error and includes the error details.
 *
 * @param instance The current instance of the SocketService.
 * @param error The error object representing the reconnection error.
 * @returns {Function} A handler function for the 'reconnect_error' event.
 */
export function handleReconnectError(instance: SocketService) {
  return (error: any) => {
    if (instance.state.debug) {
      console.debug(`SocketService::on 'reconnect_error'`, error);
    }
  };
}
