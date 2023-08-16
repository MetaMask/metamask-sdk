import EventEmitter2 from 'eventemitter2';
import { v4 as uuidv4 } from 'uuid';
import { RemoteCommunicationState } from '../../RemoteCommunication';
import { ConnectionStatus } from '../../types/ConnectionStatus';
import { DisconnectOptions } from '../../types/DisconnectOptions';
import { MessageType } from '../../types/MessageType';
import { setConnectionStatus } from './setConnectionStatus';

export function disconnect({
  options,
  state,
  emit,
}: {
  options?: DisconnectOptions;
  state: RemoteCommunicationState;
  emit: EventEmitter2['emit'];
}) {
  if (state.debug) {
    console.debug(
      `RemoteCommunication::disconnect() channel=${state.channelId}`,
      options,
    );
  }

  state.ready = false;
  state.paused = false;

  if (options?.terminate) {
    // remove channel config from persistence layer and close active connections.
    state.storageManager?.terminate(state.channelId ?? '');

    if (
      state.communicationLayer?.getKeyInfo().keysExchanged &&
      options?.sendMessage
    ) {
      state.communicationLayer?.sendMessage({
        type: MessageType.TERMINATE,
      });
    }

    state.channelId = uuidv4();
    options.channelId = state.channelId;
    state.channelConfig = undefined;
    state.originatorConnectStarted = false;
    state.communicationLayer?.disconnect(options);
    setConnectionStatus(ConnectionStatus.TERMINATED, state, emit);
  } else {
    state.communicationLayer?.disconnect(options);
    setConnectionStatus(ConnectionStatus.DISCONNECTED, state, emit);
  }
}
