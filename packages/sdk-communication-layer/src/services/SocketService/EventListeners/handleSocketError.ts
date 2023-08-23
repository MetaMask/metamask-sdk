import { SocketService } from '../../../SocketService';
import { checkFocusAndReconnect } from '../ConnectionManager/checkFocusAndReconnect';

/**
 * Returns a handler function to handle the 'error' event of the socket.
 * This handler logs the error and then calls the checkFocusAndReconnect function
 * to check the focus status and attempt to reconnect if necessary.
 *
 * @param instance The current instance of the SocketService.
 * @param error The error object that occurred.
 */
export function handleSocketError(instance: SocketService) {
  return (error: any) => {
    if (instance.state.debug) {
      console.debug(`SocketService::on 'error' `, error);
    }

    checkFocusAndReconnect(instance);
  };
}
