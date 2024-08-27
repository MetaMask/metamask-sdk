import { SocketService } from '../../../SocketService';
import { logger } from '../../../utils/logger';
import { reconnectSocket } from '../ConnectionManager/reconnectSocket';

/**
 * Returns a handler function to handle the 'error' event of the socket.
 * This handler logs the error and then calls the checkFocusAndReconnect function
 * to check the focus status and attempt to reconnect if necessary.
 *
 * @param instance The current instance of the SocketService.
 * @param error The error object that occurred.
 */
export function handleSocketError(instance: SocketService) {
  return (error: Error) => {
    logger.SocketService(
      `[SocketService: handleSocketError()] on 'error' `,
      error,
    );

    reconnectSocket(instance).catch((_e) => {
      console.error(
        `[SocketService: handleSocketError()] error in reconnectSocket`,
        error,
      );
    });
  };
}
