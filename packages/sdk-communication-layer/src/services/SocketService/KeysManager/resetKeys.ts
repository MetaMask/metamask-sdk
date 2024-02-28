import { loggerServiceLayer } from '../../../utils/logger';
import { SocketService } from '../../../SocketService';

/**
 * Resets the keys associated with a SocketService instance.
 * If debugging is enabled, a debug message is logged.
 *
 * @param instance The current instance of the SocketService.
 */
export function resetKeys(instance: SocketService) {
  loggerServiceLayer(`[SocketService: resetKeys()] Resetting keys.`);

  instance.state.keyExchange?.resetKeys();
}
