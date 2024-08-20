// packages/sdk-communication-layer/src/services/SocketService/ConnectionManager/connectToChannel.ts
import { SocketService } from '../../../SocketService';
import { ConnectToChannelOptions } from '../../../types/ConnectToChannelOptions';
import { EventType } from '../../../types/EventType';
import { setupChannelListeners } from '../ChannelManager';
import { handleJoinChannelResults } from './handleJoinChannelResult';

/**
 * Connects a SocketService instance to a specified channel.
 * If the socket is already connected, an error is thrown.
 * The function sets up listeners for the channel and emits a JOIN_CHANNEL event.
 *
 * @param options The options required to connect to the channel,
 * including the channel ID, whether a key exchange is needed,
 * and if the current instance is the originator.
 * @param instance The current instance of the SocketService.
 * @throws {Error} Throws an error if the socket is already connected.
 */
export async function connectToChannel({
  options,
  instance,
}: {
  options: ConnectToChannelOptions;
  instance: SocketService;
}): Promise<void> {
  const { channelId, authorized, withKeyExchange } = options;
  const { state, remote } = instance;
  const { isOriginator = false, socket, keyExchange } = state;
  const { channelConfig } = remote.state;

  if (socket?.connected) {
    console.error(
      `[SocketService: connectToChannel()] socket already connected`,
    );
    throw new Error(`socket already connected`);
  }

  if (isOriginator && channelConfig?.relayPersistence) {
    const { localKey, otherKey } = channelConfig;
    if (localKey && otherKey) {
      keyExchange?.setRelayPersistence({ localKey, otherKey });
    } else {
      console.warn(`Missing keys in relay persistence`, channelConfig);
    }
  }

  Object.assign(state, {
    manualDisconnect: false,
    withKeyExchange,
    isOriginator,
    channelId,
  });

  socket?.connect();
  setupChannelListeners(instance, channelId);

  if (!isOriginator && authorized) {
    keyExchange?.setKeysExchanged(true);
    Object.assign(remote.state, { ready: true, authorized: true });
  }

  return new Promise((resolve) => {
    const publicKey = keyExchange?.getKeyInfo()?.ecies.public;
    const withWalletKey = authorized && !isOriginator ? publicKey : undefined;

    socket?.emit(
      EventType.JOIN_CHANNEL,
      {
        channelId,
        context: `${state.context}_connectToChannel`,
        clientType: isOriginator ? 'dapp' : 'wallet',
        publicKey: withWalletKey,
      },
      async (
        error: string | null,
        result?: { ready: boolean; persistence?: boolean; walletKey?: string },
      ) => {
        await handleJoinChannelResults(instance, error, result);
        resolve();
      },
    );
  });
}
