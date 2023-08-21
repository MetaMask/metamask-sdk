import { v4 as uuidv4 } from 'uuid';
import { RemoteCommunication } from '../../RemoteCommunication';
import { ConnectionStatus } from '../../types/ConnectionStatus';
import { DisconnectOptions } from '../../types/DisconnectOptions';
import { MessageType } from '../../types/MessageType';

/**
 * Handles the disconnection process for a RemoteCommunication instance. Depending on the provided options, it can terminate the connection and clear related configurations or simply disconnect.
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
  if (instance.state.debug) {
    console.debug(
      `RemoteCommunication::disconnect() channel=${instance.state.channelId}`,
      options,
    );
  }

  instance.state.ready = false;
  instance.state.paused = false;

  if (options?.terminate) {
    // remove channel config from persistence layer and close active connections.
    instance.state.storageManager?.terminate(instance.state.channelId ?? '');

    if (
      instance.state.communicationLayer?.getKeyInfo().keysExchanged &&
      options?.sendMessage
    ) {
      instance.state.communicationLayer?.sendMessage({
        type: MessageType.TERMINATE,
      });
    }

    instance.state.channelId = uuidv4();
    options.channelId = instance.state.channelId;
    instance.state.channelConfig = undefined;
    instance.state.originatorConnectStarted = false;
    instance.state.communicationLayer?.disconnect(options);
    instance.setConnectionStatus(ConnectionStatus.TERMINATED);
  } else {
    instance.state.communicationLayer?.disconnect(options);
    instance.setConnectionStatus(ConnectionStatus.DISCONNECTED);
  }
}
