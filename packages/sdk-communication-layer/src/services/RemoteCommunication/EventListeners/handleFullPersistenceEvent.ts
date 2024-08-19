import { DEFAULT_SESSION_TIMEOUT_MS } from '../../../config';
import { RemoteCommunication } from '../../../RemoteCommunication';
import { EventType } from '../../../types/EventType';
import { logger } from '../../../utils/logger';

export function handleFullPersistenceEvent(instance: RemoteCommunication) {
  return async () => {
    const { state } = instance;

    logger.RemoteCommunication(
      `[RemoteCommunication: handleFullPersistenceEvent()] context=${state.context}`,
    );

    instance.state.ready = true;
    instance.state.clientsConnected = true;
    instance.state.authorized = true;
    instance.state.relayPersistence = true;
    instance.state.communicationLayer?.getKeyExchange().setKeysExchanged(true);

    instance.emit(EventType.KEYS_EXCHANGED, {
      keysExchanged: true,
      isOriginator: true,
    });

    // Automatically ready and authorized
    instance.emit(EventType.AUTHORIZED);
    instance.emit(EventType.CLIENTS_READY);
    instance.emit(EventType.CHANNEL_PERSISTENCE);
    try {
      // Update channelConfig with full relay persistence
      state.channelConfig = {
        ...state.channelConfig,
        localKey: state.communicationLayer?.getKeyExchange().getKeyInfo().ecies
          .private,
        otherKey: state.communicationLayer
          ?.getKeyExchange()
          .getOtherPublicKey(),
        channelId: state.channelId ?? '',
        validUntil:
          state.channelConfig?.validUntil ?? DEFAULT_SESSION_TIMEOUT_MS,
        relayPersistence: true,
      };

      await state.storageManager?.persistChannelConfig(
        state.channelConfig,
        'handleFullPersistenceEvent',
      );
    } catch (error) {
      console.error(`Error persisting channel config`, error);
    }
  };
}
