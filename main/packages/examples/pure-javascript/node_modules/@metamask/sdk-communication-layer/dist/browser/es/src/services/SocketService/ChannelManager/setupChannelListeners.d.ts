import { SocketService } from '../../../SocketService';
/**
 * Sets up event listeners for a SocketService instance associated with a specific channel.
 * If debugging is enabled, a debug message is logged indicating the setup process.
 * Event listeners are added to the socket for events defined in the
 * `socketEventListenerMap`, `channelEventListenerMap`, and `keyExchangeEventListenerMap`.
 *
 * @param instance The current instance of the SocketService.
 * @param channelId The ID of the channel associated with the listeners.
 */
export declare function setupChannelListeners(instance: SocketService, channelId: string): void;
//# sourceMappingURL=setupChannelListeners.d.ts.map