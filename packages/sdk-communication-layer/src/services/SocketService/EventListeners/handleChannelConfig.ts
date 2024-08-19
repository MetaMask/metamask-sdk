import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { KeyExchangeMessageType } from '../../../types/KeyExchangeMessageType';
import { MessageType } from '../../../types/MessageType';
import { logger } from '../../../utils/logger';

export function handleChannelConfig(
  instance: SocketService,
  channelId: string,
) {
  return async (config: { persistence: boolean; walletKey: string }) => {
    logger.SocketService(
      `[SocketService: handleChannelConfig()] update relayPersistence on 'config-${channelId}'`,
      config,
    );

    const { persistence, walletKey } = config;

    if (instance.state.isOriginator && instance.remote.state.channelConfig) {
      if (config.walletKey && !instance.remote.state.channelConfig.otherKey) {
        logger.SocketService(`Setting wallet key ${walletKey}`);
        instance.remote.state.channelConfig.otherKey = walletKey;
        instance.getKeyExchange().setOtherPublicKey(config.walletKey);
        instance.state.keyExchange?.setKeysExchanged(true);
        await instance.remote.sendMessage({
          type: KeyExchangeMessageType.KEY_HANDSHAKE_ACK,
        });

        await instance.remote.sendMessage({
          type: MessageType.PING,
        });

        await instance.remote.state.storageManager?.persistChannelConfig(
          instance.remote.state.channelConfig,
        );
      }

      if (
        persistence === true &&
        !instance.remote.state.channelConfig.relayPersistence
      ) {
        logger.SocketService(`Setting relay persistence ${persistence}`);
        instance.remote.state.channelConfig.relayPersistence = persistence;

        instance.remote.state.relayPersistence = true;
        instance.remote.emit(EventType.CHANNEL_PERSISTENCE);

        // Force authorized as we have wallet key
        instance.remote.state.authorized = true;
        instance.remote.state.ready = true;
        instance.remote.emit(EventType.AUTHORIZED);

        await instance.remote.state.storageManager?.persistChannelConfig(
          instance.remote.state.channelConfig,
        );
      }
    } else if (!instance.state.isOriginator) {
      if (config.persistence) {
        instance.remote.state.relayPersistence = true;
        instance.remote.emit(EventType.CHANNEL_PERSISTENCE);
      }
    }
  };
}
