import { logger } from '../../../utils/logger';
import { SocketService } from '../../../SocketService';
import { reconnectSocket } from './reconnectSocket';

/**
 * Checks the focus status of the document and triggers socket reconnection if necessary.
 * If the document has focus, it immediately calls the reconnectSocket function to attempt reconnection.
 * If the document doesn't have focus, it sets up a focus event listener to trigger reconnection once the document regains focus.
 * The focus event listener is added only once per SocketService instance.
 *
 * @param instance The current instance of the SocketService.
 */
export function checkFocusAndReconnect(instance: SocketService) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  logger.SocketService(
    `[SocketService: checkFocusAndReconnect()] hasFocus=${document.hasFocus()}`,
    instance,
  );

  // Check if we've already added a focus listener for this instance
  if (!instance.state.focusListenerAdded) {
    const focusHandler = () => {
      logger.SocketService(`Document has focus --- reconnecting socket`);
      reconnectSocket(instance).catch((err) => {
        console.error(
          `SocketService::checkFocus Error reconnecting socket`,
          err,
        );
      });
    };

    window.addEventListener('focus', focusHandler);

    // Mark that we've added the listener for this instance
    instance.state.focusListenerAdded = true;

    // Optionally, add a method to remove the listener if needed
    instance.state.removeFocusListener = () => {
      window.removeEventListener('focus', focusHandler);
      instance.state.focusListenerAdded = false;
    };
  }

  // If the document already has focus, try to reconnect immediately
  if (document.hasFocus()) {
    reconnectSocket(instance).catch((err) => {
      console.error(`SocketService::checkFocus Error reconnecting socket`, err);
    });
  }
}
