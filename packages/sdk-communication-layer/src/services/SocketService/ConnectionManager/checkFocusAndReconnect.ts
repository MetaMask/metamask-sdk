import { logger } from '../../../utils/logger';
import { SocketService } from '../../../SocketService';
import { reconnectSocket } from './reconnectSocket';

/**
 * Checks the focus status of the document and triggers socket reconnection if necessary.
 * If the document has focus, it immediately calls the reconnectSocket function to attempt reconnection.
 * If the document doesn't have focus, it sets up a focus event listener to trigger reconnection once the document regains focus.
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

  if (document.hasFocus()) {
    reconnectSocket(instance)
      .then((success) => {
        logger.SocketService(
          `SocketService::checkFocus reconnectSocket success=${success}`,
          instance,
        );
      })
      .catch((err) => {
        console.error(
          `SocketService::checkFocus Error reconnecting socket`,
          err,
        );
      });
  } else {
    window.addEventListener(
      'focus',
      () => {
        reconnectSocket(instance).catch((err) => {
          console.error(
            `SocketService::checkFocus Error reconnecting socket`,
            err,
          );
        });
      },
      {
        once: true,
      },
    );
  }
}
