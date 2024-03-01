import { DisconnectOptions } from '@metamask/sdk-communication-layer';
import { logger } from '../../../utils/logger';
import { Ethereum } from '../../Ethereum';
import { RemoteConnectionState } from '../RemoteConnection';

/**
 * Handles the disconnection process for a MetaMask connection based on the current state and provided options.
 *
 * @param state Current state of the RemoteConnection class instance.
 * @param options Configuration options for the disconnection.
 * @returns Promise<void>
 */
export async function handleDisconnect(
  state: RemoteConnectionState,
  options: DisconnectOptions,
): Promise<void> {
  logger(`[RemoteConnection: disconnect()]`, options);

  if (options?.terminate) {
    Ethereum.getProvider().handleDisconnect({
      terminate: true,
    });
    state.pendingModal?.unmount?.();
    state.otpAnswer = undefined;
  }
  state.connector?.disconnect(options);
}
