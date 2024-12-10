import { SocketService } from '../../../SocketService';
/**
 * Returns a handler function to handle the 'error' event of the socket.
 * This handler logs the error and then calls the checkFocusAndReconnect function
 * to check the focus status and attempt to reconnect if necessary.
 *
 * @param instance The current instance of the SocketService.
 * @param error The error object that occurred.
 */
export declare function handleSocketError(instance: SocketService): (error: Error) => void;
//# sourceMappingURL=handleSocketError.d.ts.map