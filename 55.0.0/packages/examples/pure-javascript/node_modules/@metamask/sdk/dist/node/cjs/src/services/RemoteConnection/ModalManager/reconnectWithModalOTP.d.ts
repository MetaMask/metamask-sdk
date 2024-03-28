import { ChannelConfig } from '@metamask/sdk-communication-layer';
import { RemoteConnectionProps, RemoteConnectionState } from '../RemoteConnection';
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
export declare function reconnectWithModalOTP(state: RemoteConnectionState, options: RemoteConnectionProps, channelConfig: ChannelConfig): Promise<void>;
//# sourceMappingURL=reconnectWithModalOTP.d.ts.map