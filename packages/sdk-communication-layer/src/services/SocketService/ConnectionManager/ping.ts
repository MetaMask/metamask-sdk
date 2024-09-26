import { SocketService } from '../../../SocketService';
import { MessageType } from '../../../types/MessageType';
import { logger } from '../../../utils/logger';

/**
 * Sends a PING message using a SocketService instance.
 * If the instance is not the originator and keys have been exchanged,
 * a READY message is sent. If the keys haven't been exchanged,
 * the key exchange process is initiated. Finally, a PING message
 * is emitted to the socket.
 *
 * @param instance The current instance of the SocketService.
 */
export async function ping(instance: SocketService) {
  logger.SocketService(
    `[SocketService: ping()] context=${instance.state.context} originator=${
      instance.state.isOriginator
    } keysExchanged=${instance.state.keyExchange?.areKeysExchanged()}`,
  );

  instance.state.socket?.emit(MessageType.PING, {
    id: instance.state.channelId,
    context: 'ping',
    clientType: instance.remote.state.isOriginator ? 'dapp' : 'wallet',
    message: '',
  });
}
