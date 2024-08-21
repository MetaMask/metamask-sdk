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
export function resume(instance: SocketService): void {
  const { state, remote } = instance;
  const { socket, channelId, context, keyExchange, isOriginator } = state;
  const { isOriginator: remoteIsOriginator } = remote.state;

  logger.SocketService(
    `[SocketService: resume()] channelId=${channelId} context=${context} connected=${
      socket?.connected
    } manualDisconnect=${state.manualDisconnect} resumed=${
      state.resumed
    } keysExchanged=${keyExchange?.areKeysExchanged()}`,
  );

  if (!channelId) {
    logger.SocketService(`[SocketService: resume()] channelId is not defined`);
    throw new Error('ChannelId is not defined');
  }

  if (socket?.connected) {
    logger.SocketService(`[SocketService: resume()] already connected.`);
    socket.emit(MessageType.PING, {
      id: channelId,
      clientType: remoteIsOriginator ? 'dapp' : 'wallet',
      context: 'on_channel_config',
      message: '',
    });

    if (!remote.hasRelayPersistence() && !keyExchange?.areKeysExchanged()) {
      // Always try to recover key exchange from both side (wallet / dapp)
      if (isOriginator) {
        instance.sendMessage({ type: MessageType.READY });
      } else {
        keyExchange?.start({ isOriginator: false });
      }
    }
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
        result?: {
          ready: boolean;
          persistence?: boolean;
          walletKey?: string;
        },
      ) => {
        try {
          await handleJoinChannelResults(instance, error, result);
        } catch (runtimeError) {
          console.warn(`Error reconnecting to channel`, runtimeError);
        }
      },
    );
  }

  state.manualDisconnect = false;
  state.resumed = true;
}
