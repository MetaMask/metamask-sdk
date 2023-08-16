import EventEmitter2 from 'eventemitter2';
import { RemoteCommunicationState } from '../../RemoteCommunication';
import { RPC_METHODS } from '../../config';
import { CommunicationLayerMessage } from '../../types/CommunicationLayerMessage';
import { EventType } from '../../types/EventType';

export function handleOtpMessage(
  state: RemoteCommunicationState,
  message: CommunicationLayerMessage,
  emit: EventEmitter2['emit'],
) {
  // OTP message are ignored on the wallet.
  emit(EventType.OTP, message.otpAnswer);

  // backward compatibility for wallet <6.6
  if ('6.6'.localeCompare(state.walletInfo?.version || '') === 1) {
    console.warn(
      `RemoteCommunication::on 'otp' -- backward compatibility <6.6 -- triger eth_requestAccounts`,
    );

    emit(EventType.SDK_RPC_CALL, {
      method: RPC_METHODS.ETH_REQUESTACCOUNTS,
      params: [],
    });
  }
}
