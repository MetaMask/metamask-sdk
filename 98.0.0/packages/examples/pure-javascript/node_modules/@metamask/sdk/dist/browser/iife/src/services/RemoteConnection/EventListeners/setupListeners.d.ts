import { RequestArguments } from '@metamask/providers';
import { RemoteConnection, RemoteConnectionState } from '../RemoteConnection';
type SDKRPCCallHandler = (requestParams: RequestArguments) => Promise<void>;
type WalletInitHandler = (data: {
    accounts: string[];
    chainId: string;
}) => Promise<void>;
type AuthorizedHandler = () => Promise<void>;
type ClientsDisconnectedHandler = () => void;
type TerminateHandler = () => void;
export type EventHandler = SDKRPCCallHandler | WalletInitHandler | AuthorizedHandler | ClientsDisconnectedHandler | TerminateHandler;
/**
 * Sets up event listeners for MetaMask remote communication and handles responses accordingly.
 *
 * @param state Current state of the RemoteConnection class instance.
 * @param options Configuration options for the events.
 * @returns void
 */
export declare function setupListeners(state: RemoteConnectionState, _options: RemoteConnection['options']): void;
export {};
//# sourceMappingURL=setupListeners.d.ts.map