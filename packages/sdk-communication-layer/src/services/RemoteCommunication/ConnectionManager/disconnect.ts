import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../../utils/logger';
import { RemoteCommunication } from '../../../RemoteCommunication';
import { ConnectionStatus } from '../../../types/ConnectionStatus';
import { DisconnectOptions } from '../../../types/DisconnectOptions';
import { MessageType } from '../../../types/MessageType';
import { encryptAndSendMessage } from '../../SocketService/MessageHandlers';
import { SendAnalytics } from '../../../Analytics';
import { TrackingEvents } from '../../../types/TrackingEvent';

/**
 * Handles the disconnection process for a RemoteCommunication instance Depending on the provided options, it can terminate the connection and clear related configurations or simply disconnect.
 *
 * @param options Optional settings that determine how the disconnection is handled. It can specify whether to terminate the connection, send a termination message, or reset the channel ID.
 * @param instance The current instance of the RemoteCommunication class that needs to be disconnected.
 * @returns void
 */
export async function disconnect({
  options,
  instance,
}: {
  options?: DisconnectOptions;
  instance: RemoteCommunication;
}): Promise<boolean> {
  const { state } = instance;

  logger.RemoteCommunication(
    `[RemoteCommunication: disconnect()] channel=${state.channelId}`,
    options,
  );

  return new Promise<boolean>((resolve, reject) => {
    if (options?.terminate) {
      if (instance.state.ready) {
        SendAnalytics(
          {
            id: instance.state.channelId ?? '',
            event: TrackingEvents.TERMINATED,
          },
          instance.state.analyticsServerUrl,
        ).catch((err) => {
          console.error(`[handleSendMessage] Cannot send analytics`, err);
        });
      }

      state.ready = false;
      state.paused = false;

      // remove channel config from persistence layer and close active connections.
      state.storageManager?.terminate(state.channelId ?? '');
      instance.state.terminated = true;
      if (options.sendMessage) {
        // Prevent sending terminate in loop
        if (
          state.communicationLayer?.getKeyInfo().keysExchanged &&
          instance.state.communicationLayer
        ) {
          encryptAndSendMessage(instance.state.communicationLayer, {
            type: MessageType.TERMINATE,
          })
            .then(() => {
              console.warn(
                `[disconnect] Terminate message sent to the other peer`,
              );
              resolve(true);
            })
            .catch((error) => {
              reject(error);
            });
        }
      } else {
        resolve(true);
      }

      state.authorized = false;
      state.relayPersistence = false;
      state.channelId = uuidv4();
      options.channelId = state.channelId;
      state.channelConfig = undefined;
      state.originatorConnectStarted = false;
      state.communicationLayer?.disconnect(options);
      instance.setConnectionStatus(ConnectionStatus.TERMINATED);
    } else {
      state.communicationLayer?.disconnect(options);
      instance.setConnectionStatus(ConnectionStatus.DISCONNECTED);
      resolve(true);
    }
  });
}
