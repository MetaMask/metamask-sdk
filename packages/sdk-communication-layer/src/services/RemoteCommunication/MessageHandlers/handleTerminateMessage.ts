import { RemoteCommunication } from '../../../RemoteCommunication';
import { EventType } from '../../../types/EventType';
import { disconnect } from '../ConnectionManager';

/**
 * Handles the 'terminate' message for a `RemoteCommunication` instance.
 *
 * The termination process is initiated when a 'terminate' message is received. The purpose of this function is to ensure
 * that the communication channel is closed and the associated configurations are removed from persistence, specifically
 * when the current instance is the originator of the communication.
 *
 * The sequence of actions taken on receiving a 'terminate' message is as follows:
 *
 * 1. Check if the current instance is the originator. If not, this function will not proceed further.
 * 2. If it is the originator, call the `disconnect` function with options to terminate the channel without sending a
 *    'terminate' message back (to avoid recursive termination).
 * 3. Output a debug message to the console. (Note: The `console.debug()` call seems to be missing its arguments. It
 *    should ideally print a meaningful message regarding the termination process.)
 * 4. Emit a `TERMINATE` event to inform other parts of the system that the channel has been terminated.
 *
 * @param instance The `RemoteCommunication` instance that needs to be acted upon when a terminate message is received.
 */
export function handleTerminateMessage(instance: RemoteCommunication) {
  const { state } = instance;

  // remove channel config from persistence layer and close active connections.
  if (state.isOriginator) {
    disconnect({
      options: { terminate: true, sendMessage: false },
      instance,
    });
    console.debug();
    instance.emit(EventType.TERMINATE);
  }
}
