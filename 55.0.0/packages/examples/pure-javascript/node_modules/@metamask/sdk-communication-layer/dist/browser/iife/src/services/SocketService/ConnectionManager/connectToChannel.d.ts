import { SocketService } from '../../../SocketService';
import { ConnectToChannelOptions } from '../../../types/ConnectToChannelOptions';
/**
 * Connects a SocketService instance to a specified channel.
 * If the socket is already connected, an error is thrown.
 * The function sets up listeners for the channel and emits a JOIN_CHANNEL event.
 *
 * @param options The options required to connect to the channel,
 * including the channel ID, whether a key exchange is needed,
 * and if the current instance is the originator.
 * @param instance The current instance of the SocketService.
 * @throws {Error} Throws an error if the socket is already connected.
 */
export declare function connectToChannel({ options, instance, }: {
    options: ConnectToChannelOptions;
    instance: SocketService;
}): void;
//# sourceMappingURL=connectToChannel.d.ts.map