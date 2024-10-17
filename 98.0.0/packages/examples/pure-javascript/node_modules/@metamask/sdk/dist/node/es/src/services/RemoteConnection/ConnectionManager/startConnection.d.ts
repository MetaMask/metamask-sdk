import { RPCCall } from '../../../Platform/MetaMaskInstaller';
import { RemoteConnectionProps, RemoteConnectionState } from '../RemoteConnection';
export interface StartConnectionExtras {
    initialCheck?: boolean;
    connectWith?: RPCCall;
}
/**
 * Initiates the connection process to MetaMask, choosing the appropriate connection method based on state and options.
 *
 * @param state Current state of the RemoteConnection class instance.
 * @param options Configuration options for the connection.
 * @returns Promise<void>
 */
export declare function startConnection(state: RemoteConnectionState, options: RemoteConnectionProps, { initialCheck, connectWith }?: StartConnectionExtras): Promise<void>;
//# sourceMappingURL=startConnection.d.ts.map