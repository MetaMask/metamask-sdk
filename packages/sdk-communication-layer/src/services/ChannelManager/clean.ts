import { RemoteCommunicationState } from '../../RemoteCommunication';

export function clean(state: RemoteCommunicationState) {
  if (state.debug) {
    console.debug(`RemoteCommunication::${state.context}::clean()`);
  }

  state.channelConfig = undefined;
  state.ready = false;
  state.originatorConnectStarted = false;
}
