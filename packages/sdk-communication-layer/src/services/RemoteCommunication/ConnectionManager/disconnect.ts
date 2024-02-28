import { v4 as uuidv4 } from 'uuid';
import { loggerRemoteLayer } from '../../../utils/logger';
import { RemoteCommunication } from '../../../RemoteCommunication';
import { ConnectionStatus } from '../../../types/ConnectionStatus';
import { DisconnectOptions } from '../../../types/DisconnectOptions';
import { MessageType } from '../../../types/MessageType';

/**
 * Handles the disconnection process for a RemoteCommunication instance Depending on the provided options, it can terminate the connection and clear related configurations or simply disconnect.
 *
 * @param options Optional settings that determine how the disconnection is handled. It can specify whether to terminate the connection, send a termination message, or reset the channel ID.
 * @param instance The current instance of the RemoteCommunication class that needs to be disconnected.
 * @returns void
 */
export function disconnect({
  options,
  instance,
}: {
  options?: DisconnectOptions;
  instance: RemoteCommunication;
}) {
  const { state } = instance;

  loggerRemoteLayer(
    `[RemoteCommunication: disconnect()] channel=${state.channelId}`,
    options,
  );

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
    instance.setConnectionStatus(ConnectionStatus.TERMINATED);
  } else {
    state.communicationLayer?.disconnect(options);
    instance.setConnectionStatus(ConnectionStatus.DISCONNECTED);
  }
}
