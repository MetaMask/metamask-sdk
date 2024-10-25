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
export declare function handleDisconnect({ terminate, instance, }: {
    terminate: boolean;
    instance: SDKProvider;
}): void;
//# sourceMappingURL=handleDisconnect.d.ts.map