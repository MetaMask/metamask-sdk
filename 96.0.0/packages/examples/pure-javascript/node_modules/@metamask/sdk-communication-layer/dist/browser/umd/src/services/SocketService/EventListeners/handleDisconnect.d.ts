import { SocketService } from '../../../SocketService';
/**
 * Returns a handler function to handle the 'disconnect' event.
 * This handler checks whether the disconnection was manual or due to other reasons.
 * If it wasn't a manual disconnect, it emits the SOCKET_DISCONNECTED event and attempts to reconnect.
 *
 * @param instance The current instance of the SocketService.
 * @returns {Function} A handler function for the 'disconnect' event.
 */
export declare function handleDisconnect(instance: SocketService): (reason: string) => void;
//# sourceMappingURL=handleDisconnect.d.ts.map