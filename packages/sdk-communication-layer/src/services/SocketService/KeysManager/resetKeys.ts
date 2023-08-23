import { SocketService } from '../../../SocketService';

/**
 * Resets the keys associated with a SocketService instance.
 * If debugging is enabled, a debug message is logged.
 *
 * @param instance The current instance of the SocketService.
 */
export function resetKeys(instance: SocketService) {
  if (instance.state.debug) {
    console.debug(`SocketService::resetKeys()`);
  }
  instance.state.keyExchange?.resetKeys();
}
