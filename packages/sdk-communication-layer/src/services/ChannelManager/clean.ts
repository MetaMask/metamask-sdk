import { RemoteCommunicationState } from '../../RemoteCommunication';

/**
 * Cleans the state of the RemoteCommunication, resetting various properties to their default values.
 *
 * @param state Current state of the RemoteCommunication class instance.
 * @returns void
 */
export function clean(state: RemoteCommunicationState) {
  if (state.debug) {
    console.debug(`RemoteCommunication::${state.context}::clean()`);
  }

  state.channelConfig = undefined;
  state.ready = false;
  state.originatorConnectStarted = false;
}
