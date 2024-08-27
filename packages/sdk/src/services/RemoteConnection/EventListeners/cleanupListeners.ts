import { RemoteConnectionState } from '../RemoteConnection';

export function cleanupListeners(state: RemoteConnectionState): void {
  state.listeners.forEach(({ event, handler }) => {
    state.connector?.off(event, handler);
  });
  state.listeners = [];
}
