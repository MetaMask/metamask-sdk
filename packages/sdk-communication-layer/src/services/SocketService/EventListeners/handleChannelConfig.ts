import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { logger } from '../../../utils/logger';

export function handleChannelConfig(
  instance: SocketService,
  channelId: string,
) {
  return async (config: { persistence: boolean }) => {
    logger.SocketService(
      `[SocketService: handleChannelConfig()] update relayPersistence on 'config-${channelId}'`,
      config,
    );

    instance.remote.state.relayPersistence = true;
    instance.remote.emit(EventType.CHANNEL_PERSISTENCE);
    instance.state.keyExchange?.setKeysExchanged(true);

    if (
      instance.state.isOriginator &&
      instance.remote.state.channelConfig &&
      !instance.remote.state.channelConfig.relayPersistence
    ) {
      instance.remote.state.channelConfig.relayPersistence = true;
      instance.remote.state.storageManager?.persistChannelConfig(
        instance.remote.state.channelConfig,
      );
    }
  };
}
