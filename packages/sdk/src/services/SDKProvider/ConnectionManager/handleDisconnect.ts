import { ethErrors } from 'eth-rpc-errors';
import { logger } from '../../../utils/logger';
import { SDKProvider } from '../../../provider/SDKProvider';

/**
 * Handles the disconnection of an SDKProvider instance.
 *
 * This function is responsible for cleaning up the state of an SDKProvider instance upon disconnection.
 * If the `terminate` flag is set to true, it clears various state attributes like `chainId`, `accounts`, and `selectedAddress`.
 * It also sets the `_state.isUnlocked` and `_state.isPermanentlyDisconnected` flags to false, marking the provider as disconnected.
 * An 'eth-rpc-error' for disconnection is emitted at the end.
 *
 * @param options An object containing:
 *  - `terminate`: A boolean flag indicating whether to terminate the connection and clear state variables.
 *  - `instance`: The SDKProvider instance that is being disconnected.
 * @returns void
 * @emits 'disconnect' event along with an 'eth-rpc-error' describing the disconnection.
 */
export function handleDisconnect({
  terminate = false,
  instance,
}: {
  terminate: boolean;
  instance: SDKProvider;
}) {
  const { state } = instance;

  const connected = instance.isConnected();
  if (!connected) {
    logger(
      `[SDKProvider: handleDisconnect()] not connected --- interrupt disconnection`,
    );
    return;
  }

  logger(
    `[SDKProvider: handleDisconnect()] cleaning up provider state terminate=${terminate}`,
    instance,
  );

  if (terminate) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    instance._state.accounts = null;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    instance._state.isUnlocked = false;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    instance._state.isPermanentlyDisconnected = true;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    instance._state.initialized = false;
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  instance._handleAccountsChanged([]);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  instance._state.isConnected = false;
  instance.emit('disconnect', ethErrors.provider.disconnected());

  state.providerStateRequested = false;
}
