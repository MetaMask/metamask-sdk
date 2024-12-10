import { RemoteCommunication } from '../../../RemoteCommunication';
/**
 * Creates and returns an event handler function for the "AUTHORIZED" event. The handler function manages the authorization process for the given RemoteCommunication instance.
 *
 * This function performs several tasks:
 * 1. Skips processing if the instance is already authorized.
 * 2. Ensures the wallet version info is available, polling if necessary.
 * 3. Implements backward compatibility for wallets with versions earlier than 7.3. It checks against a hardcoded version to decide whether to proceed with the event handling.
 * 4. Identifies if the platform is considered "secure" based on predefined platform types.
 * 5. If on a secure platform, the instance's state is updated to indicate it's authorized and the "AUTHORIZED" event is emitted.
 *
 * @param instance The instance of RemoteCommunication to be processed.
 * @returns A function which acts as the event handler for the "AUTHORIZED" event.
 */
export declare function handleAuthorizedEvent(instance: RemoteCommunication): () => Promise<void>;
//# sourceMappingURL=handleAuthorizedEvent.d.ts.map