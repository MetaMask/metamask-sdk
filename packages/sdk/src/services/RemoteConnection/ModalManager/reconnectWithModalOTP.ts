import { ChannelConfig } from '@metamask/sdk-communication-layer';
import { Ethereum } from '../../Ethereum';
import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';
import { onOTPModalDisconnect } from './onOTPModalDisconnect';
import { waitForOTPAnswer } from './waitForOTPAnswer';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

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
  channelConfig: ChannelConfig,
): Promise<void> {
  const provider = Ethereum.getProvider();

  const currentTime = Date.now();
  const channelWasActiveRecently =
    channelConfig.lastActive !== undefined &&
    currentTime - channelConfig.lastActive < ONE_HOUR_IN_MS;

  if (channelWasActiveRecently) {
    provider._setConnected();

    state.pendingModal = options.modals.otp?.({
      debug: state.developerMode,
    });

    state.installModal?.unmount?.(false);
    state.pendingModal?.unmount?.();

    state.pendingModal?.mount?.({
      displayOTP: false,
    });

    state.authorized = true;

    if (state.developerMode) {
      console.debug(
        `RCPMS::on 'authorized' provider.state`,
        provider.getState(),
      );
    }

    return;
  }

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
