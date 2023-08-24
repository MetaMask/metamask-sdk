import { SocketService } from '../../../SocketService';

/**
 * Returns a handler function to handle the 'ping' event.
 * This handler logs a debug message when a 'ping' event is received.
 *
 * @param instance The current instance of the SocketService.
 * @returns {Function} A handler function for the 'ping' event.
 */
export function handlePing(instance: SocketService) {
  return () => {
    if (instance.state.debug) {
      console.debug(`SocketService::on 'ping'`);
    }
  };
}
