import { SocketService } from '../../../SocketService';
import { DisconnectOptions } from '../../../types/DisconnectOptions';
/**
 * Disconnects a SocketService instance from its current connection.
 * If the termination option is provided, the channel ID is reset and
 * any existing key exchanges are cleaned up. Additionally, the rpcMethodTracker
 * is reset and the socket is manually disconnected.
 *
 * @param instance The current instance of the SocketService.
 * @param options Optional parameters for the disconnect process,
 * including whether to terminate the connection and the channel ID.
 */
export declare function disconnect(instance: SocketService, options?: DisconnectOptions): void;
//# sourceMappingURL=disconnect.d.ts.map