import { SocketService } from '../../../SocketService';
/**
 * Sends a PING message using a SocketService instance.
 * If the instance is not the originator and keys have been exchanged,
 * a READY message is sent. If the keys haven't been exchanged,
 * the key exchange process is initiated. Finally, a PING message
 * is emitted to the socket.
 *
 * @param instance The current instance of the SocketService.
 */
export declare function ping(instance: SocketService): void;
//# sourceMappingURL=ping.d.ts.map