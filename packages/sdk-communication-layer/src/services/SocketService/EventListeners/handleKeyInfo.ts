import { loggerServiceLayer } from '../../../utils/logger';
import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';

/**
 * Returns a handler function to handle the 'KEY_INFO' event.
 * This handler emits the KEY_INFO event with the provided event data.
 *
 * @param instance The current instance of the SocketService.
 * @param {any} event The event data for the 'KEY_INFO' event.
 * @returns {Function} A handler function for the 'KEY_INFO' event.
 */
export function handleKeyInfo(instance: SocketService) {
  return (event: any) => {
    loggerServiceLayer(`[SocketService: handleKeyInfo()] on 'KEY_INFO'`, event);

    instance.emit(EventType.KEY_INFO, event);
  };
}
