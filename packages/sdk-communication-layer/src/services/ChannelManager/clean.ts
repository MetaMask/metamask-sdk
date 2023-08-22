import { RemoteCommunicationState } from '../../RemoteCommunication';

/**
 * Cleans the state of the RemoteCommunication, resetting various properties to their default values.
 *
 * @param state Current state of the RemoteCommunication class instance.
 * @returns void
 */
export function clean(state: RemoteCommunicationState) {
  const { debug, context } = state;
  if (debug) {
    console.debug(`RemoteCommunication::${context}::clean()`);
  }

  state.channelConfig = undefined;
  state.ready = false;
  state.originatorConnectStarted = false;
}
