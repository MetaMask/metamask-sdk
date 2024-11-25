import { RemoteCommunication } from '../../../RemoteCommunication';
/**
 * Handles the 'ready' message for a `RemoteCommunication` instance.
 *
 * When the system receives a 'ready' message, this function performs the following actions:
 *
 * 1. Updates the connection status to `ConnectionStatus.LINKED`, indicating that a successful link has been established.
 * 2. Checks the current paused status. If the system was in a paused state, it keeps track of this status so that subsequent actions can be aware of the resumed state.
 * 3. Resets the paused status to indicate that the communication is no longer paused.
 * 4. Emits a `CLIENTS_READY` event with information about the originator and wallet to notify other parts of the system.
 * 5. If the system was previously in a paused state (resumed), it assumes that the connection is authorized. As a result, the authorized status is set to true, and an `AUTHORIZED` event is emitted.
 *
 * @param instance The `RemoteCommunication` instance whose state needs to be updated in response to a ready message.
 */
export declare function handleReadyMessage(instance: RemoteCommunication): void;
//# sourceMappingURL=handleReadyMessage.d.ts.map