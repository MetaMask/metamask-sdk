import { logger } from '../../../utils/logger';
import { RemoteConnectionState } from '../RemoteConnection';

/**
 * Displays the relevant active modal based on the current connection state.
 *
 * @param state Current state of the RemoteConnection class instance.
 * @returns void
 */
export function showActiveModal(state: RemoteConnectionState): void {
  if (state.authorized) {
    logger(`[RemoteConnection: showActiveModal()] already authorized`);
    return;
  }

  if (state.pendingModal) {
    // only display the modal if the connection is not authorized
    state.pendingModal.mount?.();
  } else if (state.installModal) {
    state.installModal.mount?.(state.qrcodeLink || '');
  }
}
