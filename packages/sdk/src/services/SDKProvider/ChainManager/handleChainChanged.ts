import { SDKProvider } from '../../../provider/SDKProvider';

/**
 * Handles a change in the blockchain network for an SDKProvider instance.
 *
 * This function is responsible for updating the state and emitting events when the chain or network version changes.
 * It updates the `_state.isConnected` property to true and emits a 'connect' event with the new `chainId`.
 * The function then calls `superHandleChainChanged` to perform additional updates.
 *
 * If the `networkVersion` parameter is missing (observed especially on RN IOS), the function sets it to '1' as a fallback to prevent provider errors.
 *
 * @param options An object containing:
 *  - `chainId`: An optional string representing the new blockchain chain ID.
 *  - `networkVersion`: An optional string representing the new network version.
 *  - `instance`: The SDKProvider instance that is experiencing the chain change.
 *  - `superHandleChainChanged`: A function to perform additional updates and passed the new `chainId` and `networkVersion`.
 * @returns void
 * @emits 'connect' event with the new `chainId`.
 */
export function handleChainChanged({
  instance,
  chainId,
  networkVersion,
  superHandleChainChanged,
}: {
  chainId?: string;
  networkVersion?: string;
  instance: SDKProvider;
  superHandleChainChanged: (args: {
    chainId?: string;
    networkVersion?: string;
  }) => void;
}) {
  const { state } = instance;

  if (state.debug) {
    console.debug(
      `SDKProvider::_handleChainChanged chainId=${chainId} networkVersion=${networkVersion}`,
    );
  }

  // FIXME on RN IOS networkVersion is sometime missing? why?
  let forcedNetworkVersion = networkVersion;
  if (!networkVersion) {
    console.info(`forced network version to prevent provider error`);
    forcedNetworkVersion = '1';
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  instance._state.isConnected = true;
  instance.emit('connect', { chainId });
  superHandleChainChanged({
    chainId,
    networkVersion: forcedNetworkVersion,
  });
}
