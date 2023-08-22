import { RemoteCommunication } from '../../RemoteCommunication';
import { RPC_METHODS } from '../../config';
import { CommunicationLayerMessage } from '../../types/CommunicationLayerMessage';
import { EventType } from '../../types/EventType';

/**
 * Handles the OTP (One-Time Password) message for a `RemoteCommunication` instance.
 *
 * When a message contains an OTP, this function manages the OTP authentication process and ensures compatibility with older versions of the system. Specifically, it:
 *
 * 1. Emits the received OTP answer, making it available to any interested listeners.
 * 2. Checks the version of the wallet currently communicating with the system.
 *    - If the wallet version is below 6.6, the function triggers the `eth_requestAccounts` RPC call for backward compatibility. This is likely because older wallet versions (below 6.6) required an additional step in the OTP authentication process that newer versions might have eliminated or modified.
 *
 * @param instance The `RemoteCommunication` instance on which the OTP message is processed.
 * @param message The received `CommunicationLayerMessage` containing the OTP answer.
 */
export function handleOtpMessage(
  instance: RemoteCommunication,
  message: CommunicationLayerMessage,
) {
  const { state } = instance;

  // OTP message are ignored on the wallet.
  instance.emit(EventType.OTP, message.otpAnswer);

  // backward compatibility for wallet <6.6
  if ('6.6'.localeCompare(state.walletInfo?.version || '') === 1) {
    console.warn(
      `RemoteCommunication::on 'otp' -- backward compatibility <6.6 -- triger eth_requestAccounts`,
    );

    instance.emit(EventType.SDK_RPC_CALL, {
      method: RPC_METHODS.ETH_REQUESTACCOUNTS,
      params: [],
    });
  }
}
