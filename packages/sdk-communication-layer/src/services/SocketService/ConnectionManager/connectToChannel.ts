import { SocketService } from '../../../SocketService';
import { ConnectToChannelOptions } from '../../../types/ConnectToChannelOptions';
import { EventType } from '../../../types/EventType';
import { KeyExchangeMessageType } from '../../../types/KeyExchangeMessageType';
import { MessageType } from '../../../types/MessageType';
import { logger } from '../../../utils/logger';
import { setupChannelListeners } from '../ChannelManager';

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
  const isOriginator = instance.state.isOriginator ?? false;

  logger.SocketService(
    `[SocketService: connectToChannel()] context=${instance.state.context} channelId=${channelId} isOriginator=${isOriginator}`,
    instance.state.keyExchange?.toString(),
  );

  if (instance.state.socket?.connected) {
    console.error(
      `[SocketService: connectToChannel()] socket already connected`,
    );
    throw new Error(`socket already connected`);
  }

  const { channelConfig } = instance.remote.state;

  if (isOriginator && channelConfig?.relayPersistence) {
    if (
      channelConfig.localKey &&
      channelConfig?.localKey?.length > 0 &&
      channelConfig.otherKey &&
      channelConfig?.otherKey?.length > 0
    ) {
      // Update key exchange status with persisted keys
      instance.state.keyExchange?.setRelayPersistence({
        localKey: channelConfig.localKey,
        otherKey: channelConfig.otherKey,
      });
    } else {
      console.warn(`Missing keys in relay persistence`, channelConfig);
    }
  }
  instance.state.manualDisconnect = false;
  instance.state.socket?.connect();
  instance.state.withKeyExchange = withKeyExchange;
  instance.state.isOriginator = isOriginator;
  instance.state.channelId = channelId;
  setupChannelListeners(instance, channelId);

  if (!isOriginator && authorized) {
    instance.state.keyExchange?.setKeysExchanged(true);
    instance.remote.state.ready = true;
    instance.remote.state.authorized = true;
  }

  return new Promise((resolve) => {
    const publicKey = instance.state.keyExchange?.getKeyInfo()?.ecies.public;
    const withWalletKey = authorized && !isOriginator ? publicKey : undefined;
    instance.state.socket?.emit(
      EventType.JOIN_CHANNEL,
      {
        channelId,
        context: `${instance.state.context}_connectToChannel`,
        clientType: isOriginator ? 'dapp' : 'wallet',
        publicKey: withWalletKey,
      },
      async (
        error: string | null,
        result?: { ready: boolean; persistence?: boolean; walletKey?: string },
      ) => {
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
            console.log(`Setting wallet key ${result.walletKey}`);
            instance.getKeyExchange().setOtherPublicKey(result.walletKey);
            instance.state.keyExchange?.setKeysExchanged(true);
            instance.remote.state.ready = true;
            instance.remote.state.authorized = true;
            // Save channel config
            instance.remote.emit(EventType.KEYS_EXCHANGED);

            instance.sendMessage({
              type: KeyExchangeMessageType.KEY_HANDSHAKE_ACK,
            });

            instance.state.socket?.emit(MessageType.PING, {
              id: channelId,
              clientType: isOriginator ? 'dapp' : 'wallet',
              context: 'on_channel_config',
              message: '',
            });
          }
        }

        resolve();
      },
    );
  });
}
