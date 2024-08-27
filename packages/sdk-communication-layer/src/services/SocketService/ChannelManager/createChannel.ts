import { v4 as uuidv4 } from 'uuid';
import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { logger } from '../../../utils/logger';
import { handleJoinChannelResults } from '../ConnectionManager/handleJoinChannelResult';
import { Channel } from '../../../types/Channel';
import { setupChannelListeners } from './setupChannelListeners';

/**
 * Creates a new communication channel for a given SocketService instance.
 * If debugging is enabled, logs the creation process. If the socket is not
 * connected, it initiates a connection. The function also sets up listeners
 * for the new channel and emits a JOIN_CHANNEL event.
 *
 * @param instance The current instance of the SocketService.
 * @returns {Object} An object containing the newly generated channel ID and
 * the public key associated with the instance, if available.
 * @property {string} channelId The unique identifier for the newly created channel.
 * @property {string} pubKey The public key associated with the SocketService
 * instance, or an empty string if not available.
 */
export async function createChannel(instance: SocketService): Promise<Channel> {
  logger.SocketService(
    `[SocketService: createChannel()] context=${instance.state.context}`,
  );

  if (!instance.state.socket) {
    instance.initSocket();
  }

  if (instance.state.socket?.connected) {
    console.error(`[SocketService: createChannel()] socket already connected`);
    throw new Error(`socket already connected`);
  }

  instance.state.socket?.connect();
  instance.state.manualDisconnect = false;
  instance.state.isOriginator = true;
  const channelId = uuidv4();
  instance.state.channelId = channelId;
  setupChannelListeners(instance, channelId);
  await new Promise<void>((resolve, reject) => {
    instance.state.socket?.emit(
      EventType.JOIN_CHANNEL,
      {
        channelId,
        context: `${instance.state.context}createChannel`,
        clientType: 'dapp', // only dapp can create channel
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
          resolve();
        } catch (runtimeError) {
          reject(runtimeError);
        }
      },
    );
  });
  const keyInfo = instance.state.keyExchange?.getKeyInfo();
  return {
    channelId,
    pubKey: keyInfo?.ecies.public || '',
    privKey: keyInfo?.ecies.private || '',
  };
}
