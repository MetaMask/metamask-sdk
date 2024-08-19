import { logger } from '../../../utils/logger';
import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { wait } from '../../../utils/wait';
import { KeyExchangeMessageType } from '../../../types/KeyExchangeMessageType';
import { MessageType } from '../../../types/MessageType';
import { ChannelConfig } from '../../../types/ChannelConfig';
import { DEFAULT_SESSION_TIMEOUT_MS } from '../../../config';
import { ConnectionStatus } from '../../../types/ConnectionStatus';

/**
 * Attempts to reconnect the socket after a disconnection.
 * It first waits for a brief delay to prevent potential issues, then checks if the socket is not already connected.
 * If the socket is not connected, it sets the `resumed` state to true, reconnects the socket, and emits a SOCKET_RECONNECT event.
 * It also emits a JOIN_CHANNEL event to rejoin the channel.
 *
 * @param instance The current instance of the SocketService.
 */
export const reconnectSocket = async (instance: SocketService) => {
  if (instance.remote.state.terminated) {
    // Make sure the connection wasn't terminated, no need to reconnect automatically if it was.
    logger.SocketService(
      `[SocketService: reconnectSocket()] instance.remote.state.terminated=${instance.remote.state.terminated} socket already terminated`,
      instance,
    );
    return false;
  }

  logger.SocketService(
    `[SocketService: reconnectSocket()] instance.state.socket?.connected=${instance.state.socket?.connected} trying to reconnect after socketio disconnection`,
    instance,
  );

  // Add delay to prevent IOS error
  // https://stackoverflow.com/questions/53297188/afnetworking-error-53-during-attempted-background-fetch
  await wait(200);

  if (!instance.state.socket?.connected) {
    instance.state.resumed = true;
    instance.state.socket?.connect();

    instance.emit(EventType.SOCKET_RECONNECT);
    instance.state.socket?.emit(
      EventType.JOIN_CHANNEL,
      {
        channelId: instance.state.channelId,
        context: `${instance.state.context}connect_again`,
        clientType: instance.state.isOriginator ? 'dapp' : 'wallet',
      },
      async (
        error: string | null,
        result?: { ready: boolean; persistence?: boolean; walletKey?: string },
      ) => {
        try {
          if (error === 'error_terminated') {
            instance.emit(EventType.TERMINATE);
          } else if (typeof result === 'object') {
            if (result.persistence) {
              // Inform that this channel supports full session persistence
              instance.emit(EventType.CHANNEL_PERSISTENCE);
              // Below manual state changes are redundant to the above event but we need them in case the event code is not triggered fast enough.
              instance.state.keyExchange?.setKeysExchanged(true);
              instance.remote.state.ready = true;
              instance.remote.state.authorized = true;
            }

            if (
              result.walletKey &&
              !instance.remote.state.channelConfig?.otherKey
            ) {
              instance.getKeyExchange().setOtherPublicKey(result.walletKey);
              instance.state.keyExchange?.setKeysExchanged(true);
              instance.remote.state.ready = true;
              instance.remote.state.authorized = true;

              const { state } = instance.remote;
              // Save channel config
              // Update channelConfig with the new keys
              const channelConfig: ChannelConfig = {
                ...state.channelConfig,
                channelId: state.channelId ?? '',
                validUntil: Date.now() + DEFAULT_SESSION_TIMEOUT_MS, // extend session timeout
                localKey: state.communicationLayer?.getKeyInfo().ecies.private,
                otherKey: result.walletKey,
              };

              instance.sendMessage({
                type: KeyExchangeMessageType.KEY_HANDSHAKE_ACK,
              });

              instance.state.socket?.emit(MessageType.PING, {
                id: instance.state.channelId,
                clientType: instance.state.isOriginator ? 'dapp' : 'wallet',
                context: 'on_channel_reconnect',
                message: '',
              });

              await state.storageManager?.persistChannelConfig(channelConfig);
              instance.remote.emitServiceStatusEvent();
              instance.remote.setConnectionStatus(ConnectionStatus.LINKED);
            }
          }
        } catch (runtimeError) {
          console.warn(`Error reconnecting to channel`, runtimeError);
        }
      },
    );
  }

  // wait again to make sure socket status is updated.
  await wait(100);
  return instance.state.socket?.connected;
};
