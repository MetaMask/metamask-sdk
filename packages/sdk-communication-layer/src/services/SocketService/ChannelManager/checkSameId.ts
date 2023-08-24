import { SocketServiceState } from '../../../SocketService';

/**
 * Validates if the provided ID matches the current channel ID of the SocketServiceState. If the IDs do not match and debugging is enabled, an error message is logged to the console. An error is thrown for a mismatched ID.
 *
 * @param state The current state of the SocketService instance.
 * @param id The ID to be checked against the current channel ID.
 * @throws {Error} Throws an error if the provided ID does not match the current channel ID.
 */
export function checkSameId(state: SocketServiceState, id: string) {
  if (id !== state.channelId) {
    if (state.debug) {
      console.error(`Wrong id ${id} - should be ${state.channelId}`);
    }
    throw new Error('Wrong id');
  }
}
