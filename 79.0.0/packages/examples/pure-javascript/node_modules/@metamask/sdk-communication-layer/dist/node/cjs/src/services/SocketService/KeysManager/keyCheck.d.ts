import { SocketService } from '../../../SocketService';
/**
 * Checks the validity of the keys associated with a SocketService instance.
 * A KEY_HANDSHAKE_CHECK message is emitted to the socket, containing
 * the instance's channel ID and public key. This message can be used to verify
 * the validity of the keys on the other side of the communication.
 *
 * @param instance The current instance of the SocketService.
 */
export declare function keyCheck(instance: SocketService): void;
//# sourceMappingURL=keyCheck.d.ts.map