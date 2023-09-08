import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';
import { onOTPModalDisconnect } from './onOTPModalDisconnect';
import { waitForOTPAnswer } from './waitForOTPAnswer';

/**
 * Reconnects to MetaMask using an OTP modal and waits for an OTP answer.
 *
 * @param state Current state of the RemoteConnection class instance.
 * @param options Configuration options for the OTP modal.
 * @returns Promise<void>
 */
export async function reconnectWithModalOTP(
  state: RemoteConnectionState,
  options: RemoteConnectionProps,
): Promise<void> {
  if (state.pendingModal) {
    state.pendingModal?.mount?.();
  } else {
    state.pendingModal = options.modals.otp?.({
      debug: state.developerMode,
      onDisconnect: () => onOTPModalDisconnect(options, state),
    });
  }

  const otp = await waitForOTPAnswer(state);

  if (state.otpAnswer !== otp) {
    state.otpAnswer = otp;
    state.pendingModal?.updateOTPValue?.(otp);
  }
}
