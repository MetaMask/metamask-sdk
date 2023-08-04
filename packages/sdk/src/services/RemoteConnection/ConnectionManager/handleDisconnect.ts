import { DisconnectOptions } from '@metamask/sdk-communication-layer';
import { Ethereum } from '../../Ethereum';
import { RemoteConnectionState } from '../RemoteConnection';

export async function handleDisconnect(
  state: RemoteConnectionState,
  options: DisconnectOptions,
): Promise<void> {
  if (state.developerMode) {
    console.debug(`RemoteConnection::disconnect()`, options);
  }

  if (options?.terminate) {
    Ethereum.getProvider().handleDisconnect({
      terminate: true,
    });
    state.pendingModal?.unmount?.();
    state.otpAnswer = undefined;
  }
  state.connector?.disconnect(options);
}
