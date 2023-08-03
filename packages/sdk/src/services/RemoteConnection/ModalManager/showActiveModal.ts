import { RemoteConnectionState } from '../RemoteConnection';

export function showActiveModal(state: RemoteConnectionState): void {
  if (state.authorized) {
    if (state.developerMode) {
      console.debug(`RemoteConnection::showActiveModal() already authorized`);
    }
    return;
  }

  if (state.pendingModal) {
    // only display the modal if the connection is not authorized
    state.pendingModal.mount?.();
  } else if (state.installModal) {
    state.installModal.mount?.(state.universalLink || '');
  }
}
