import { SocketService } from '../../../SocketService';
/**
 * Creates a new communication channel for a given SocketService instance.
 * If debugging is enabled, logs the creation process. If the socket is not
 * connected, it initiates a connection. The function also sets up listeners
 * for the new channel and emits a JOIN_CHANNEL event.
 *
 * @param instance The current instance of the SocketService.
 * @returns {Object} An object containing the newly generated channel ID and
 * the public key associated with the instance, if available.
 * @property {string} channelId The unique identifier for the newly created channel.
 * @property {string} pubKey The public key associated with the SocketService
 * instance, or an empty string if not available.
 */
export declare function createChannel(instance: SocketService): {
    channelId: string;
    pubKey: string;
};
//# sourceMappingURL=createChannel.d.ts.map