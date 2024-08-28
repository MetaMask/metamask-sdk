import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { KeyExchangeMessageType } from '../../../types/KeyExchangeMessageType';
import { MessageType } from '../../../types/MessageType';
import { ChannelConfig } from '../../../types/ChannelConfig';
import { DEFAULT_SESSION_TIMEOUT_MS } from '../../../config';
import { ConnectionStatus } from '../../../types/ConnectionStatus';
import { logger } from '../../../utils/logger';

export const handleJoinChannelResults = async (
  instance: SocketService,
  error: string | null,
  result?: { ready: boolean; persistence?: boolean; walletKey?: string },
) => {
  const { remote, state } = instance;
  const { channelId, isOriginator } = state;

  if (error === 'error_terminated') {
    logger.SocketService(
      `handleJoinChannelResults: Channel ${channelId} terminated`,
    );
    instance.emit(EventType.TERMINATE);
    return;
  }

  if (!result) {
    logger.SocketService(
      `handleJoinChannelResults: No result for channel ${channelId}`,
    );
    return;
  }

  const { persistence, walletKey } = result;

  logger.SocketService(
    `handleJoinChannelResults: Channel ${channelId} persistence=${persistence} walletKey=${walletKey}`,
  );

  if (walletKey && !remote.state.channelConfig?.otherKey) {
    const keyExchange = instance.getKeyExchange();
    keyExchange.setOtherPublicKey(walletKey);
    instance.state.keyExchange?.setKeysExchanged(true);
    remote.state.ready = true;
    remote.state.authorized = true;
    remote.emit(EventType.AUTHORIZED);

    const { communicationLayer, storageManager } = remote.state;

    const channelConfig: ChannelConfig = {
      ...remote.state.channelConfig,
      channelId: remote.state.channelId ?? '',
      validUntil: Date.now() + DEFAULT_SESSION_TIMEOUT_MS,
      localKey: communicationLayer?.getKeyInfo().ecies.private,
      otherKey: walletKey,
    };

    instance.sendMessage({
      type: KeyExchangeMessageType.KEY_HANDSHAKE_ACK,
    });

    instance.state.socket?.emit(MessageType.PING, {
      id: channelId,
      clientType: isOriginator ? 'dapp' : 'wallet',
      context: 'on_channel_reconnect',
      message: '',
    });

    await storageManager?.persistChannelConfig(channelConfig);
    remote.emitServiceStatusEvent();
    remote.setConnectionStatus(ConnectionStatus.LINKED);
  }

  if (persistence) {
    instance.emit(EventType.CHANNEL_PERSISTENCE);
    instance.state.keyExchange?.setKeysExchanged(true);
    remote.state.ready = true;
    remote.state.authorized = true;
    remote.emit(EventType.AUTHORIZED);
  }
};
