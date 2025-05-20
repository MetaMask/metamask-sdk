import { SocketService } from '../../../SocketService';
/**
 * Returns a handler function to handle the 'keys_exchanged' event.
 * This handler emits the KEYS_EXCHANGED event with the current key exchange status and whether the instance is the originator.
 * Additionally, it emits the SERVICE_STATUS event with the current key information.
 *
 * @param instance The current instance of the SocketService.
 * @returns {Function} A handler function for the 'keys_exchanged' event.
 */
export declare function handleKeysExchanged(instance: SocketService): () => void;
//# sourceMappingURL=handleKeysExchanged.d.ts.map