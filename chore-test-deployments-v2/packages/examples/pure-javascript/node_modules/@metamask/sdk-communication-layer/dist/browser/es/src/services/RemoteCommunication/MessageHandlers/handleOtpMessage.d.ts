import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
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
export declare function handleOtpMessage(instance: RemoteCommunication, message: CommunicationLayerMessage): void;
//# sourceMappingURL=handleOtpMessage.d.ts.map