import { ChannelConfig } from '@metamask/sdk-communication-layer';
import { Ethereum } from '../../Ethereum';
import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';
import { ONE_HOUR_IN_MS } from '../../../constants';
import { onOTPModalDisconnect } from './onOTPModalDisconnect';
import { waitForOTPAnswer } from './waitForOTPAnswer';

/**
 * Reconnects to MetaMask using an OTP modal and waits for an OTP answer.
 *
 * - If MetaMask's channel was active in the last hour, it reconnects without requiring OTP.
 * - Otherwise, prompts user for OTP and waits for a response.
 *
 * @param state Current state of the RemoteConnection class instance.
 * @param options Configuration options for the OTP modal.
 * @param channelConfig Configuration related to the communication channel with MetaMask.
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
      i18nInstance: options.i18nInstance,
      debug: state.developerMode,
      onDisconnect: () => onOTPModalDisconnect(options, state),
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
      i18nInstance: options.i18nInstance,
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
