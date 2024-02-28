import { loggerServiceLayer } from '../../../utils/logger';
import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { MessageType } from '../../../types/MessageType';

/**
 * Resumes the connection of a SocketService instance.
 * If the socket is already connected, a debug message is logged.
 * Otherwise, the socket is connected and a JOIN_CHANNEL event is emitted.
 * The function also ensures that the necessary key exchanges are
 * performed before resuming the connection. If keys have been exchanged
 * and the instance is not the originator, a READY message is sent.
 *
 * @param instance The current instance of the SocketService.
 */
export function resume(instance: SocketService) {
  loggerServiceLayer(
    `[SocketService: resume()] context=${instance.state.context} connected=${
      instance.state.socket?.connected
    } manualDisconnect=${instance.state.manualDisconnect} resumed=${
      instance.state.resumed
    } keysExchanged=${instance.state.keyExchange?.areKeysExchanged()}`,
  );

  if (instance.state.socket?.connected) {
    loggerServiceLayer(`[SocketService: resume()] already connected.`);
  } else {
    instance.state.socket?.connect();

    loggerServiceLayer(
      `[SocketService: resume()] after connecting socket --> connected=${instance.state.socket?.connected}`,
    );

    // Useful to re-emmit otherwise dapp might sometime loose track of the connection event.
    instance.state.socket?.emit(
      EventType.JOIN_CHANNEL,
      instance.state.channelId,
      `${instance.state.context}_resume`,
    );
  }

  // Always try to recover key exchange from both side (wallet / dapp)
  if (instance.state.keyExchange?.areKeysExchanged()) {
    if (!instance.state.isOriginator) {
      // this message will be ignored by the dapp if it has restarted and updated keys.
      // Dapp will then init another key exchange.
      instance.sendMessage({ type: MessageType.READY });
    }
  } else if (!instance.state.isOriginator) {
    // Ask to start key exchange
    instance.state.keyExchange?.start({
      isOriginator: instance.state.isOriginator ?? false,
    });
  }

  instance.state.manualDisconnect = false;
  instance.state.resumed = true;
}
