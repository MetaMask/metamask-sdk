import { RequestArguments } from '@metamask/providers';
import { EventType } from '@metamask/sdk-communication-layer';
import { logger } from '../../../utils/logger';
import { Ethereum } from '../../Ethereum';
import { RemoteConnection, RemoteConnectionState } from '../RemoteConnection';
import { cleanupListeners } from './cleanupListeners';

// Define specific types for each event handler
type SDKRPCCallHandler = (requestParams: RequestArguments) => Promise<void>;
type WalletInitHandler = (data: {
  accounts: string[];
  chainId: string;
}) => Promise<void>;
type AuthorizedHandler = () => Promise<void>;
type ClientsDisconnectedHandler = () => void;
type TerminateHandler = () => void;

// Union type for all possible handlers
export type EventHandler =
  | SDKRPCCallHandler
  | WalletInitHandler
  | AuthorizedHandler
  | ClientsDisconnectedHandler
  | TerminateHandler;

/**
 * Sets up event listeners for MetaMask remote communication and handles responses accordingly.
 *
 * @param state Current state of the RemoteConnection class instance.
 * @param options Configuration options for the events.
 * @returns void
 */
export function setupListeners(
  state: RemoteConnectionState,
  _options: RemoteConnection['options'],
): void {
  if (!state.connector) {
    return;
  }

  // Clear existing listeners if any
  cleanupListeners(state);

  function addListener(event: EventType, handler: EventHandler) {
    state.connector?.on(event, handler);
    state.listeners.push({ event, handler });
  }

  addListener(EventType.WALLET_INIT, (async ({ accounts, chainId }) => {
    logger(
      `[RemoteConnection: setupListeners() => EventType.WALLET_INIT] 'wallet_init' accounts=${accounts} chainId=${chainId}`,
    );

    const provider = Ethereum.getProvider();
    provider._setConnected();

    const initialState = {
      accounts,
      chainId,
      isUnlocked: false,
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    provider._initializeState(initialState);
    provider.emit('chainChanged', chainId);
    provider.emit('accountsChanged', accounts);
  }) as WalletInitHandler);

  addListener(EventType.AUTHORIZED, (async () => {
    try {
      logger(
        `[RemoteConnection: setupListeners() => EventType.AUTHORIZED] 'authorized' closing modals`,
        state.pendingModal,
        state.installModal,
      );

      // Force connected state on provider
      // This prevents some rpc method being received in Ethereum before connected state is.
      const provider = Ethereum.getProvider();
      provider._setConnected();

      // close modals
      state.pendingModal?.unmount?.();
      state.installModal?.unmount?.(false);
      state.otpAnswer = undefined;
      state.authorized = true;

      logger(
        `[RemoteConnection: setupListeners() => EventType.AUTHORIZED] 'authorized' provider.state`,
        provider.getState(),
      );

      await provider.forceInitializeState();
    } catch (err) {
      // Ignore error if already initialized.
      // console.debug(`IGNORE ERROR`, err);
    }
  }) as AuthorizedHandler);

  // Should not be needed anymore but keeping for reference if needed for backward compatibility with older SDK (pre async communication)
  // addListener(EventType.CLIENTS_DISCONNECTED, (() => {
  //   logger(
  //     `[RemoteConnection: setupListeners() => EventType.CLIENTS_DISCONNECTED] received '${EventType.CLIENTS_DISCONNECTED}'`,
  //   );

  //   if (!state.platformManager?.isSecure()) {
  //     const provider = Ethereum.getProvider();
  //     provider.handleDisconnect({ terminate: false });
  //     state.pendingModal?.updateOTPValue?.('');
  //   }
  // }) as ClientsDisconnectedHandler);

  addListener(EventType.TERMINATE, (() => {
    state.pendingModal?.unmount?.();
    state.installModal?.unmount?.(true);
    state.pendingModal = undefined;
    state.installModal = undefined;
    state.otpAnswer = undefined;
    state.connector?.disconnect({ terminate: true });
    state.authorized = false;

    const provider = Ethereum.getProvider();
    provider.handleDisconnect({ terminate: true });

    // Clean up all listeners
    cleanupListeners(state);

    logger(`[RemoteConnection: setupListeners()] All listeners cleaned up`);
  }) as TerminateHandler);
}
