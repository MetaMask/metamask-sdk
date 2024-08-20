// packages/sdk-communication-layer/src/services/SocketService/ConnectionManager/reconnectSocket.ts
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
  const { remote, state } = instance;
  const { terminated } = remote.state;
  const { socket, channelId, context, isOriginator } = state;

  if (!socket) {
    logger.SocketService(
      `[SocketService: reconnectSocket()] socket is not defined`,
      instance,
    );
    return false;
  }

  const { connected } = socket;
  if (terminated) {
    logger.SocketService(
      `[SocketService: reconnectSocket()] terminated=${terminated} socket already terminated`,
      instance,
    );
    return false;
  }

  logger.SocketService(
    `[SocketService: reconnectSocket()] connected=${connected} trying to reconnect after socketio disconnection`,
    instance,
  );

  // Add delay to prevent IOS error
  // https://stackoverflow.com/questions/53297188/afnetworking-error-53-during-attempted-background-fetch
  await wait(200);

  if (connected) {
    console.log(`Socket already connected --- ping to retrive messages`);
    instance.state.socket?.emit(MessageType.PING, {
      id: channelId,
      clientType: isOriginator ? 'dapp' : 'wallet',
      context: 'on_channel_config',
      message: '',
    });
  } else {
    // Use a temporary variable to avoid the race condition
    const newResumedState = true;
    state.resumed = newResumedState;
    socket.connect();

    instance.emit(EventType.SOCKET_RECONNECT);
    socket.emit(
      EventType.JOIN_CHANNEL,
      {
        channelId,
        context: `${context}connect_again`,
        clientType: isOriginator ? 'dapp' : 'wallet',
      },
      async (
        error: string | null,
        result?: { ready: boolean; persistence?: boolean; walletKey?: string },
      ) => {
        try {
          if (error === 'error_terminated') {
            instance.emit(EventType.TERMINATE);
          } else if (result) {
            const { persistence, walletKey } = result;

            if (persistence) {
              instance.emit(EventType.CHANNEL_PERSISTENCE);
              instance.state.keyExchange?.setKeysExchanged(true);
              remote.state.ready = true;
              remote.state.authorized = true;
            }

            if (walletKey && !remote.state.channelConfig?.otherKey) {
              const keyExchange = instance.getKeyExchange();
              keyExchange.setOtherPublicKey(walletKey);
              instance.state.keyExchange?.setKeysExchanged(true);
              remote.state.ready = true;
              remote.state.authorized = true;

              const { state: remoteState } = remote;
              const { communicationLayer, storageManager } = remoteState;

              const channelConfig: ChannelConfig = {
                ...remoteState.channelConfig,
                channelId: remoteState.channelId ?? '',
                validUntil: Date.now() + DEFAULT_SESSION_TIMEOUT_MS,
                localKey: communicationLayer?.getKeyInfo().ecies.private,
                otherKey: walletKey,
              };

              instance.sendMessage({
                type: KeyExchangeMessageType.KEY_HANDSHAKE_ACK,
              });

              socket.emit(MessageType.PING, {
                id: channelId,
                clientType: isOriginator ? 'dapp' : 'wallet',
                context: 'on_channel_reconnect',
                message: '',
              });

              await storageManager?.persistChannelConfig(channelConfig);
              remote.emitServiceStatusEvent();
              remote.setConnectionStatus(ConnectionStatus.LINKED);
            }
          }
        } catch (runtimeError) {
          console.warn(`Error reconnecting to channel`, runtimeError);
        }
      },
    );
  }

  await wait(100);
  return socket.connected;
};
