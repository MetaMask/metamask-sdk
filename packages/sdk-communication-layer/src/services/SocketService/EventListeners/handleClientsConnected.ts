import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';

/**
 * Returns an asynchronous handler function to handle the 'clients_connected' event for a specific channel.
 * This handler informs the other layer about clients reconnection, emits a CLIENTS_CONNECTED event,
 * and handles key exchange scenarios and reconnection situations.
 *
 * @param instance The current instance of the SocketService.
 * @param channelId The ID of the channel associated with the handler.
 * @returns {Function} An asynchronous handler function for the 'clients_connected' event.
 */
export function handleClientsConnected(
  instance: SocketService,
  channelId: string,
) {
  return async (_id: string) => {
    if (instance.state.debug) {
      console.debug(
        `SocketService::${
          instance.state.context
        }::setupChannelListener::on 'clients_connected-${channelId}'  resumed=${
          instance.state.resumed
        }  clientsPaused=${
          instance.state.clientsPaused
        } keysExchanged=${instance.state.keyExchange?.areKeysExchanged()} isOriginator=${
          instance.state.isOriginator
        }`,
      );
    }

    // Inform other layer of clients reconnection
    instance.emit(EventType.CLIENTS_CONNECTED, {
      isOriginator: instance.state.isOriginator,
      keysExchanged: instance.state.keyExchange?.areKeysExchanged(),
      context: instance.state.context,
    });

    if (instance.state.resumed) {
      if (!instance.state.isOriginator) {
        // should ask to redo a key exchange because it wasn't paused.
        if (instance.state.debug) {
          console.debug(
            `SocketService::${
              instance.state.context
            }::on 'clients_connected' / keysExchanged=${instance.state.keyExchange?.areKeysExchanged()} -- backward compatibility`,
          );
        }

        instance.state.keyExchange?.start({
          isOriginator: instance.state.isOriginator ?? false,
        });
      }
      // resumed switched when connection resume.
      instance.state.resumed = false;
    } else if (instance.state.clientsPaused) {
      console.debug(
        `SocketService::on 'clients_connected' skip sending originatorInfo on pause`,
      );
    } else if (!instance.state.isOriginator) {
      // Reconnect scenario --- maybe web dapp got refreshed
      if (instance.state.debug) {
        console.debug(
          `SocketService::${
            instance.state.context
          }::on 'clients_connected' / keysExchanged=${instance.state.keyExchange?.areKeysExchanged()} -- backward compatibility`,
        );
      }

      // Add delay in case exchange was already initiated by dapp.
      // Always request key exchange from wallet since it looks like a reconnection.
      instance.state.keyExchange?.start({
        isOriginator: instance.state.isOriginator ?? false,
        force: true,
      });
    }

    instance.state.clientsConnected = true;
    instance.state.clientsPaused = false;
  };
}
