import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';

export async function reconnectWithModalOTP(
  state: RemoteConnectionState,
  options: RemoteConnectionProps,
): Promise<void> {
  const onDisconnect = () => {
    options.modals.onPendingModalDisconnect?.();
    state.pendingModal?.unmount?.();
  };

  const waitForOTP = async (): Promise<string> => {
    while (state.otpAnswer === undefined) {
      await new Promise<void>((res) => setTimeout(() => res(), 1000));
    }
    return state.otpAnswer;
  };

  if (state.pendingModal) {
    state.pendingModal?.mount?.();
  } else {
    state.pendingModal = options.modals.otp?.(onDisconnect);
  }

  const otp = await waitForOTP();
  if (state.otpAnswer !== otp) {
    state.otpAnswer = otp;
    state.pendingModal?.updateOTPValue?.(otp);
  }
}
