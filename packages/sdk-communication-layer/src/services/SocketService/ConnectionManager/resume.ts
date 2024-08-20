import { logger } from '../../../utils/logger';
import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { MessageType } from '../../../types/MessageType';
import { handleJoinChannelResults } from './handleJoinChannelResult';

/**
 * Resumes the connection of a SocketService instance.
 * If the socket is already connected, a debug message is logged.
 * Otherwise, the socket is connected and a JOIN_CHANNEL event is emitted.
 * The function also ensures that the necessary key exchanges are
 * performed before resuming the connection. If keys have been exchanged
 * and the instance is not the originator, a READY message is sent.
 *
 * @param instance The current instance of the SocketService.
 */
export function resume(instance: SocketService) {
  const { state, remote } = instance;
  const { socket, channelId, context, keyExchange, isOriginator } = state;
  const { isOriginator: remoteIsOriginator } = remote.state;

  logger.SocketService(
    `[SocketService: resume()] context=${context} connected=${
      socket?.connected
    } manualDisconnect=${state.manualDisconnect} resumed=${
      state.resumed
    } keysExchanged=${keyExchange?.areKeysExchanged()}`,
  );

  if (socket?.connected) {
    logger.SocketService(`[SocketService: resume()] already connected.`);
    socket.emit(MessageType.PING, {
      id: channelId,
      clientType: remoteIsOriginator ? 'dapp' : 'wallet',
      context: 'on_channel_config',
      message: '',
    });
  } else {
    socket?.connect();

    logger.SocketService(
      `[SocketService: resume()] after connecting socket --> connected=${socket?.connected}`,
    );

    socket?.emit(
      EventType.JOIN_CHANNEL,
      {
        channelId,
        context: `${context}_resume`,
        clientType: remoteIsOriginator ? 'dapp' : 'wallet',
      },
      async (
        error: string | null,
        result?: { ready: boolean; persistence?: boolean; walletKey?: string },
      ) => {
        try {
          await handleJoinChannelResults(instance, error, result);
        } catch (runtimeError) {
          console.warn(`Error reconnecting to channel`, runtimeError);
        }
      },
    );
  }

  // Always try to recover key exchange from both side (wallet / dapp)
  if (keyExchange?.areKeysExchanged()) {
    if (!isOriginator) {
      instance.sendMessage({ type: MessageType.READY });
    }
  } else if (!isOriginator) {
    keyExchange?.start({
      isOriginator: isOriginator ?? false,
    });
  }

  state.manualDisconnect = false;
  state.resumed = true;
}
