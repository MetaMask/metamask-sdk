import { RemoteCommunication } from '../../RemoteCommunication';
import { RPC_METHODS } from '../../config';
import { CommunicationLayerMessage } from '../../types/CommunicationLayerMessage';
import { EventType } from '../../types/EventType';

export function handleOtpMessage(
  instance: RemoteCommunication,
  message: CommunicationLayerMessage,
) {
  // OTP message are ignored on the wallet.
  instance.emit(EventType.OTP, message.otpAnswer);

  // backward compatibility for wallet <6.6
  if ('6.6'.localeCompare(instance.state.walletInfo?.version || '') === 1) {
    console.warn(
      `RemoteCommunication::on 'otp' -- backward compatibility <6.6 -- triger eth_requestAccounts`,
    );

    instance.emit(EventType.SDK_RPC_CALL, {
      method: RPC_METHODS.ETH_REQUESTACCOUNTS,
      params: [],
    });
  }
}
