import { RequestArguments } from '@metamask/providers/dist/BaseProvider';
import { EventType } from '@metamask/sdk-communication-layer';
import { Ethereum } from '../../Ethereum';
import { RemoteConnection, RemoteConnectionState } from '../RemoteConnection';

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

      if (state.developerMode) {
        console.debug(`RemoteConnection::on 'OTP' `, otpAnswer);
      }
      state.otpAnswer = otpAnswer;
      if (!state.pendingModal) {
        if (state.developerMode) {
          console.debug(`RemoteConnection::on 'OTP' init pending modal`);
        }

        const onDisconnect = () => {
          options.modals.onPendingModalDisconnect?.();
          state.pendingModal?.unmount?.();
          state.pendingModal?.updateOTPValue?.('');
        };
        state.pendingModal = options.modals.otp?.(onDisconnect);
      }
      state.pendingModal?.updateOTPValue?.(otpAnswer);
      state.pendingModal?.mount?.();
    });
  }

  // TODO this event can probably be removed in future version as it was created to maintain backward compatibility with older wallet (< 7.0.0).
  state.connector.on(
    EventType.SDK_RPC_CALL,
    async (requestParams: RequestArguments) => {
      if (state.developerMode) {
        console.debug(
          `RemoteConnection::on 'sdk_rpc_call' requestParam`,
          requestParams,
        );
      }
      const provider = Ethereum.getProvider();
      const result = await provider.request(requestParams);
      if (state.developerMode) {
        console.debug(`RemoteConnection::on 'sdk_rpc_call' result`, result);
      }
      // Close opened modals
      state.pendingModal?.unmount?.();
    },
  );

  state.connector.on(EventType.AUTHORIZED, async () => {
    try {
      if (state.developerMode) {
        console.debug(
          `RemoteConnection::on 'authorized' closing modals`,
          state.pendingModal,
          state.installModal,
        );
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

      provider.emit('connect');

      if (state.developerMode) {
        console.debug(
          `RCPMS::on 'authorized' provider.state`,
          provider.getState(),
        );
      }
      await provider.forceInitializeState();
    } catch (err) {
      // Ignore error if already initialized.
      // console.debug(`IGNORE ERROR`, err);
    }
  });

  state.connector.on(EventType.CLIENTS_DISCONNECTED, () => {
    if (state.developerMode) {
      console.debug(`[RCPMS] received '${EventType.CLIENTS_DISCONNECTED}'`);
    }

    if (!state.platformManager?.isSecure()) {
      const provider = Ethereum.getProvider();
      provider.handleDisconnect({ terminate: false });
      state.pendingModal?.updateOTPValue?.('');
    }
  });

  state.connector.on(EventType.TERMINATE, () => {
    if (state.platformManager?.isBrowser()) {
      // TODO use a modal or let user customize messsage instead
      // eslint-disable-next-line no-alert
      alert(`SDK Connection has been terminated from MetaMask.`);
    } else {
      console.info(`SDK Connection has been terminated`);
    }
    state.pendingModal?.unmount?.();
    state.pendingModal = undefined;
    state.otpAnswer = undefined;
    state.authorized = false;

    const provider = Ethereum.getProvider();
    provider.handleDisconnect({ terminate: true });
  });
}
