import { RemoteCommunication } from '../../../RemoteCommunication';
/**
 * Updates the last active date for a given `RemoteCommunication` instance and persists the
 * updated channel configuration.
 *
 * The function creates a new channel configuration (`ChannelConfig`) using the `channelId`
 * and `validUntil` values from the instance's state and the provided `lastActiveDate`.
 * This new configuration is then persisted using the instance's `storageManager`.
 *
 * If `debug` mode is enabled in the instance's state, the function logs the current channel
 * and the provided last active date.
 *
 * @param instance The `RemoteCommunication` instance whose channel configuration is to be updated.
 * @param lastActiveDate The date to set as the last active date.
 */
export declare function setLastActiveDate(instance: RemoteCommunication, lastActiveDate: Date): void;
//# sourceMappingURL=setLastActiveDate.d.ts.map