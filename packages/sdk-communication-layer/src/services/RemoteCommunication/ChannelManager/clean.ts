import { logger } from '../../../utils/logger';
import { RemoteCommunicationState } from '../../../RemoteCommunication';

/**
 * Cleans the state of the RemoteCommunication, resetting various properties to their default values.
 *
 * @param state Current state of the RemoteCommunication class instance.
 * @returns void
 */
export function clean(state: RemoteCommunicationState) {
  const { context } = state;

  logger.RemoteCommunication(
    `[RemoteCommunication: clean()] context=${context}`,
  );

  state.channelConfig = undefined;
  state.ready = false;
  state.originatorConnectStarted = false;
}
