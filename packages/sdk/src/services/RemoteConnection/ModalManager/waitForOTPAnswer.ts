import { RemoteConnectionState } from '../RemoteConnection';

export async function waitForOTPAnswer(state: RemoteConnectionState) {
  while (state.otpAnswer === undefined) {
    await new Promise<void>((res) => setTimeout(() => res(), 1000));
  }
  return state.otpAnswer;
}
