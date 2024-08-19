import { RequestArguments } from '@metamask/providers';
import { EventType, TrackingEvents } from '@metamask/sdk-communication-layer';
import { logger } from '../../../utils/logger';
import { Ethereum } from '../../Ethereum';
import { RemoteConnection, RemoteConnectionState } from '../RemoteConnection';

/**
 * Sets up event listeners for MetaMask remote communication and handles responses accordingly.
 *
 * @param state Current state of the RemoteConnection class instance.
 * @param options Configuration options for the events.
 * @returns void
 */
export function setupListeners(
  state: RemoteConnectionState,
  options: RemoteConnection['options'],
): void {
  if (!state.connector) {
    return;
  }

  if (!state.platformManager?.isSecure()) {
    state.connector.on(EventType.OTP, (otpAnswer: string) => {
      // Prevent double handling OTP message
      if (state.otpAnswer === otpAnswer) {
        return;
      }

      logger(
        `[RemoteConnection: setupListeners() => EventType.OTP] 'OTP' `,
        otpAnswer,
      );

      state.otpAnswer = otpAnswer;
      if (!state.pendingModal) {
        logger(
          `[RemoteConnection: setupListeners() => EventType.OTP] 'OTP' init pending modal`,
        );

        const onDisconnect = () => {
          options.modals.onPendingModalDisconnect?.();
          state.pendingModal?.unmount?.();
          state.pendingModal?.updateOTPValue?.('');
        };

        state.pendingModal = options.modals.otp?.({
          i18nInstance: options.i18nInstance,
          onDisconnect,
        });
      }
      state.pendingModal?.mount?.();
      state.pendingModal?.updateOTPValue?.(otpAnswer);
    });
  }

  // TODO this event can probably be removed in future version as it was created to maintain backward compatibility with older wallet (< 7.0.0).
  state.connector.on(
    EventType.SDK_RPC_CALL,
    async (requestParams: RequestArguments) => {
      logger(
        `[RemoteConnection: setupListeners() => EventType.SDK_RPC_CALL] 'sdk_rpc_call' requestParam`,
        requestParams,
      );

      const provider = Ethereum.getProvider();
      const result = await provider.request(requestParams);
      logger(
        `[RemoteConnection: setupListeners() => EventType.SDK_RPC_CALL] 'sdk_rpc_call' result`,
        result,
      );

      // Close opened modals
      state.pendingModal?.unmount?.();
    },
  );

  state.connector.on(
    EventType.WALLET_INIT,
    async ({ accounts, chainId }: { accounts: string[]; chainId: string }) => {
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
      console.log(`initialState`, initialState);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      provider._initializeState(initialState);
      provider.emit('chainChanged', chainId);
      provider.emit('accountsChanged', accounts);
    },
  );

  state.connector.on(EventType.AUTHORIZED, async () => {
    try {
      logger(
        `[RemoteConnection: setupListeners() => EventType.AUTHORIZED] 'authorized' closing modals`,
        state.pendingModal,
        state.installModal,
      );

      if (options.enableAnalytics) {
        state.analytics?.send({ event: TrackingEvents.AUTHORIZED });
      }

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
      console.log(
        '🟠 ~ file: setupListeners.ts:107 ~ state.connector.on ~ err:',
        err,
      );
      // Ignore error if already initialized.
      // console.debug(`IGNORE ERROR`, err);
    }
  });

  state.connector.on(EventType.CLIENTS_DISCONNECTED, () => {
    logger(
      `[RemoteConnection: setupListeners() => EventType.CLIENTS_DISCONNECTED] received '${EventType.CLIENTS_DISCONNECTED}'`,
    );

    if (!state.platformManager?.isSecure()) {
      const provider = Ethereum.getProvider();
      provider.handleDisconnect({ terminate: false });
      state.pendingModal?.updateOTPValue?.('');
    }
  });

  state.connector.on(EventType.TERMINATE, () => {
    if (!state.connector?.isAuthorized()) {
      // It means the connection was rejected by the user
      if (options.enableAnalytics) {
        state.analytics?.send({ event: TrackingEvents.REJECTED });
      }
    }

    if (state.platformManager?.isBrowser()) {
      // TODO use a modal or let user customize messsage instead
      // eslint-disable-next-line no-alert
      alert(`SDK Connection has been terminated from MetaMask.`);
    } else {
      console.info(`SDK Connection has been terminated`);
    }
    state.pendingModal?.unmount?.();
    state.installModal?.unmount?.(true);
    state.pendingModal = undefined;
    state.installModal = undefined;
    state.otpAnswer = undefined;
    state.connector?.disconnect({ terminate: true });
    state.authorized = false;

    const provider = Ethereum.getProvider();
    provider.handleDisconnect({ terminate: true });
  });
}
