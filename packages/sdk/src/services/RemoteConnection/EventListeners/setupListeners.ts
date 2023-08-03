import { RequestArguments } from '@metamask/providers/dist/BaseProvider';
import { EventType } from '@metamask/sdk-communication-layer';
import { Ethereum } from '../../Ethereum';
import { RemoteConnection, RemoteConnectionState } from '../RemoteConnection';

export function setupListeners(
  remoteConnectionState: RemoteConnectionState,
  options: RemoteConnection['options'],
): void {
  if (!remoteConnectionState.connector) {
    return;
  }

  if (!remoteConnectionState.platformManager?.isSecure()) {
    remoteConnectionState.connector.on(EventType.OTP, (otpAnswer: string) => {
      // Prevent double handling OTP message
      if (remoteConnectionState.otpAnswer === otpAnswer) {
        return;
      }

      if (remoteConnectionState.developerMode) {
        console.debug(`RemoteConnection::on 'OTP' `, otpAnswer);
      }
      remoteConnectionState.otpAnswer = otpAnswer;
      if (!remoteConnectionState.pendingModal) {
        if (remoteConnectionState.developerMode) {
          console.debug(`RemoteConnection::on 'OTP' init pending modal`);
        }

        const onDisconnect = () => {
          options.modals.onPendingModalDisconnect?.();
          remoteConnectionState.pendingModal?.unmount?.();
          remoteConnectionState.pendingModal?.updateOTPValue?.('');
        };
        remoteConnectionState.pendingModal = options.modals.otp?.(onDisconnect);
      }
      remoteConnectionState.pendingModal?.updateOTPValue?.(otpAnswer);
      remoteConnectionState.pendingModal?.mount?.();
    });
  }

  // TODO this event can probably be removed in future version as it was created to maintain backward compatibility with older wallet (< 7.0.0).
  remoteConnectionState.connector.on(
    EventType.SDK_RPC_CALL,
    async (requestParams: RequestArguments) => {
      if (remoteConnectionState.developerMode) {
        console.debug(
          `RemoteConnection::on 'sdk_rpc_call' requestParam`,
          requestParams,
        );
      }
      const provider = Ethereum.getProvider();
      const result = await provider.request(requestParams);
      if (remoteConnectionState.developerMode) {
        console.debug(`RemoteConnection::on 'sdk_rpc_call' result`, result);
      }
      // Close opened modals
      remoteConnectionState.pendingModal?.unmount?.();
    },
  );

  remoteConnectionState.connector.on(EventType.AUTHORIZED, async () => {
    try {
      if (remoteConnectionState.developerMode) {
        console.debug(
          `RemoteConnection::on 'authorized' closing modals`,
          remoteConnectionState.pendingModal,
          remoteConnectionState.installModal,
        );
      }

      // Force connected state on provider
      // This prevents some rpc method being received in Ethereum before connected state is.
      const provider = Ethereum.getProvider();
      provider._setConnected();

      // close modals
      remoteConnectionState.pendingModal?.unmount?.();
      remoteConnectionState.installModal?.unmount?.(false);
      remoteConnectionState.otpAnswer = undefined;
      remoteConnectionState.authorized = true;

      provider.emit('connect');

      if (remoteConnectionState.developerMode) {
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

  remoteConnectionState.connector.on(EventType.CLIENTS_DISCONNECTED, () => {
    if (remoteConnectionState.developerMode) {
      console.debug(`[RCPMS] received '${EventType.CLIENTS_DISCONNECTED}'`);
    }

    if (!remoteConnectionState.platformManager?.isSecure()) {
      const provider = Ethereum.getProvider();
      provider.handleDisconnect({ terminate: false });
      remoteConnectionState.pendingModal?.updateOTPValue?.('');
    }
  });

  remoteConnectionState.connector.on(EventType.TERMINATE, () => {
    if (remoteConnectionState.platformManager?.isBrowser()) {
      // TODO use a modal or let user customize messsage instead
      // eslint-disable-next-line no-alert
      alert(`SDK Connection has been terminated from MetaMask.`);
    } else {
      console.info(`SDK Connection has been terminated`);
    }
    remoteConnectionState.pendingModal?.unmount?.();
    remoteConnectionState.pendingModal = undefined;
    remoteConnectionState.otpAnswer = undefined;
    remoteConnectionState.authorized = false;

    const provider = Ethereum.getProvider();
    provider.handleDisconnect({ terminate: true });
  });
}
