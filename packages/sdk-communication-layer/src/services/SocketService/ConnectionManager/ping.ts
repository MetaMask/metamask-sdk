import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { MessageType } from '../../../types/MessageType';

/**
 * Sends a PING message using a SocketService instance.
 * If the instance is not the originator and keys have been exchanged,
 * a READY message is sent. If the keys haven't been exchanged,
 * the key exchange process is initiated. Finally, a PING message
 * is emitted to the socket.
 *
 * @param instance The current instance of the SocketService.
 */
export function ping(instance: SocketService) {
  if (instance.state.debug) {
    console.debug(
      `SocketService::${instance.state.context}::ping() originator=${
        instance.state.isOriginator
      } keysExchanged=${instance.state.keyExchange?.areKeysExchanged()}`,
    );
  }

  if (instance.state.isOriginator) {
    if (instance.state.keyExchange?.areKeysExchanged()) {
      console.warn(
        `SocketService::${instance.state.context}::ping() sending READY message`,
      );
      instance.sendMessage({ type: MessageType.READY });
    } else {
      console.warn(
        `SocketService::${instance.state.context}::ping() starting key exchange`,
      );

      instance.state.keyExchange?.start({
        isOriginator: instance.state.isOriginator ?? false,
      });
    }
  }

  instance.state.socket?.emit(EventType.MESSAGE, {
    id: instance.state.channelId,
    context: instance.state.context,
    message: {
      type: MessageType.PING,
    },
  });
}
