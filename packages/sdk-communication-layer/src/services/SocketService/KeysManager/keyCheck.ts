import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { KeyExchangeMessageType } from '../../../types/KeyExchangeMessageType';

/**
 * Checks the validity of the keys associated with a SocketService instance.
 * A KEY_HANDSHAKE_CHECK message is emitted to the socket, containing
 * the instance's channel ID and public key. This message can be used to verify
 * the validity of the keys on the other side of the communication.
 *
 * @param instance The current instance of the SocketService.
 */
export function keyCheck(instance: SocketService) {
  instance.state.socket?.emit(EventType.MESSAGE, {
    id: instance.state.channelId,
    context: instance.state.context,
    message: {
      type: KeyExchangeMessageType.KEY_HANDSHAKE_CHECK,
      pubkey: instance.getKeyInfo().ecies.otherPubKey,
    },
  });
}
