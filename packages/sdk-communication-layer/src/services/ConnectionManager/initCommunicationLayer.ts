import packageJson from '../../../package.json';
import { ECIESProps } from '../../ECIES';
import { RemoteCommunication } from '../../RemoteCommunication';
import { SocketService } from '../../SocketService';
import { DEFAULT_SERVER_URL } from '../../config';
import { CommunicationLayerPreference } from '../../types/CommunicationLayerPreference';
import { EventType } from '../../types/EventType';
import { OriginatorInfo } from '../../types/OriginatorInfo';
import {
  handleAuthorizedEvent,
  handleChannelCreatedEvent,
  handleClientsConnectedEvent,
  handleClientsDisconnectedEvent,
  handleClientsWaitingEvent,
  handleKeysExchangedEvent,
  handleMessageEvent,
  handleSocketDisconnectedEvent,
  handleSocketReconnectEvent,
} from '../EventListeners';

export function initCommunicationLayer({
  communicationLayerPreference,
  otherPublicKey,
  reconnect,
  ecies,
  communicationServerUrl = DEFAULT_SERVER_URL,
  instance,
}: {
  communicationLayerPreference: CommunicationLayerPreference;
  otherPublicKey?: string;
  reconnect?: boolean;
  ecies?: ECIESProps;
  communicationServerUrl?: string;
  instance: RemoteCommunication;
}) {
  // instance.state.communicationLayer?.removeAllListeners();

  switch (communicationLayerPreference) {
    case CommunicationLayerPreference.SOCKET:
      instance.state.communicationLayer = new SocketService({
        communicationLayerPreference,
        otherPublicKey,
        reconnect,
        transports: instance.state.transports,
        communicationServerUrl,
        context: instance.state.context,
        ecies,
        logging: instance.state.logging,
      });
      break;
    default:
      throw new Error('Invalid communication protocol');
  }

  let url = (typeof document !== 'undefined' && document.URL) || '';
  let title = (typeof document !== 'undefined' && document.title) || '';

  if (instance.state.dappMetadata?.url) {
    url = instance.state.dappMetadata.url;
  }

  if (instance.state.dappMetadata?.name) {
    title = instance.state.dappMetadata.name;
  }

  const originatorInfo: OriginatorInfo = {
    url,
    title,
    source: instance.state.dappMetadata?.source,
    icon: instance.state.dappMetadata?.base64Icon,
    platform: instance.state.platformType,
    apiVersion: packageJson.version,
  };
  instance.state.originatorInfo = originatorInfo;

  // TODO below listeners is only added for backward compatibility with wallet < 7.3
  instance.state.communicationLayer?.on(
    EventType.AUTHORIZED,
    handleAuthorizedEvent(instance),
  );

  instance.state.communicationLayer?.on(
    EventType.MESSAGE,
    handleMessageEvent(instance),
  );

  instance.state.communicationLayer?.on(
    EventType.CLIENTS_CONNECTED,
    handleClientsConnectedEvent(instance, communicationLayerPreference),
  );

  instance.state.communicationLayer?.on(
    EventType.KEYS_EXCHANGED,
    handleKeysExchangedEvent(instance, communicationLayerPreference),
  );

  instance.state.communicationLayer?.on(
    EventType.SOCKET_DISCONNECTED,
    handleSocketDisconnectedEvent(instance),
  );

  instance.state.communicationLayer?.on(
    EventType.SOCKET_RECONNECT,
    handleSocketReconnectEvent(instance),
  );

  instance.state.communicationLayer?.on(
    EventType.CLIENTS_DISCONNECTED,
    handleClientsDisconnectedEvent,
  );

  instance.state.communicationLayer?.on(
    EventType.CHANNEL_CREATED,
    handleChannelCreatedEvent(instance),
  );

  instance.state.communicationLayer?.on(
    EventType.CLIENTS_WAITING,
    handleClientsWaitingEvent(instance),
  );
}
