import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { ServiceStatus } from '../../../types/ServiceStatus';

/**
 * Returns a handler function to handle the 'keys_exchanged' event.
 * This handler emits the KEYS_EXCHANGED event with the current key exchange status and whether the instance is the originator.
 * Additionally, it emits the SERVICE_STATUS event with the current key information.
 *
 * @param instance The current instance of the SocketService.
 * @returns {Function} A handler function for the 'keys_exchanged' event.
 */
export function handleKeysExchanged(instance: SocketService) {
  return () => {
    if (instance.state.debug) {
      console.debug(
        `SocketService::on 'keys_exchanged' keyschanged=${instance.state.keyExchange?.areKeysExchanged()}`,
      );
    }

    // Propagate key exchange event
    instance.emit(EventType.KEYS_EXCHANGED, {
      keysExchanged: instance.state.keyExchange?.areKeysExchanged(),
      isOriginator: instance.state.isOriginator,
    });
    const serviceStatus: ServiceStatus = {
      keyInfo: instance.getKeyInfo(),
    };
    instance.emit(EventType.SERVICE_STATUS, serviceStatus);
  };
}
