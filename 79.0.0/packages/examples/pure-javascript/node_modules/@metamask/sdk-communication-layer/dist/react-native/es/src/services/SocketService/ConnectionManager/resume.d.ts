import { SocketService } from '../../../SocketService';
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
export declare function resume(instance: SocketService): void;
//# sourceMappingURL=resume.d.ts.map