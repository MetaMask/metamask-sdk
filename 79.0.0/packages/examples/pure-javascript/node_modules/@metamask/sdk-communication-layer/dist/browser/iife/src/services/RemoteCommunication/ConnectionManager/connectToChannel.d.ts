import { RemoteCommunicationState } from '../../../RemoteCommunication';
/**
 * Initiates a connection to a specified channel. Validates the channel ID, establishes a new connection if not connected, and sets necessary configurations.
 * Also persists the new channel configuration if a storage manager is available.
 *
 * @param channelId Unique identifier for the channel.
 * @param withKeyExchange Optional flag indicating if key exchange should occur during the connection process.
 * @param state Current state of the RemoteCommunication class instance.
 * @returns void
 */
export declare function connectToChannel({ channelId, withKeyExchange, state, }: {
    channelId: string;
    withKeyExchange?: boolean;
    state: RemoteCommunicationState;
}): void;
//# sourceMappingURL=connectToChannel.d.ts.map