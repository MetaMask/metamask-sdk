import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';

export function onOTPModalDisconnect(
  options: RemoteConnectionProps,
  state: RemoteConnectionState,
) {
  options.modals.onPendingModalDisconnect?.();
  state.pendingModal?.unmount?.();
}
