import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { KeyExchangeMessageType } from '../../../types/KeyExchangeMessageType';
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
        instance.sendMessage({
          type: KeyExchangeMessageType.KEY_HANDSHAKE_ACK,
        });
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
        instance.remote.emit(EventType.AUTHORIZED);

        instance.remote.state.storageManager?.persistChannelConfig(
          instance.remote.state.channelConfig,
        );
      }
    } else {
      console.warn(
        `Channel ${channelId} received CONFIG event but is not the originator`,
        config,
      );
    }
  };
}
