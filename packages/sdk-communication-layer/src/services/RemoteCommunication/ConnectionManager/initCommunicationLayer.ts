import packageJson from '../../../../package.json';
import { ECIESProps } from '../../../ECIES';
import { RemoteCommunication } from '../../../RemoteCommunication';
import { SocketService } from '../../../SocketService';
import { DEFAULT_SERVER_URL } from '../../../config';
import { CommunicationLayerPreference } from '../../../types/CommunicationLayerPreference';
import { EventType } from '../../../types/EventType';
import { OriginatorInfo } from '../../../types/OriginatorInfo';
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

type CommunicationLayerHandledEvents =
  | EventType.CLIENTS_CONNECTED
  | EventType.CLIENTS_DISCONNECTED
  | EventType.CLIENTS_WAITING
  | EventType.SOCKET_DISCONNECTED
  | EventType.SOCKET_RECONNECT
  | EventType.CHANNEL_CREATED
  | EventType.KEYS_EXCHANGED
  | EventType.AUTHORIZED
  | EventType.MESSAGE;

/**
 * Initializes the communication layer for a given RemoteCommunication  This function creates a communication layer based on the provided preference (e.g., SOCKET), sets up originator information, and attaches necessary event listeners.
 *
 * If the dappMetadata is available, this metadata is used to populate originator information such as the URL and name of the dapp.
 * This function also sets up various event listeners to handle different types of events that can occur in the communication layer, ensuring that the RemoteCommunication instance responds appropriately to each event.
 *
 * @param communicationLayerPreference Specifies the preferred communication protocol (e.g., SOCKET).
 * @param otherPublicKey The public key of the other party for communication (if available).
 * @param reconnect Indicates if the communication layer should attempt to reconnect after disconnection.
 * @param ecies The Elliptic Curve Integrated Encryption Scheme properties.
 * @param communicationServerUrl The URL of the communication server, defaults to the value in DEFAULT_SERVER_URL.
 * @param instance The current instance of the RemoteCommunication class.
 * @throws Error when an invalid communication protocol is specified.
 */
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
  const { state } = instance;
  // state.communicationLayer?.removeAllListeners();

  switch (communicationLayerPreference) {
    case CommunicationLayerPreference.SOCKET:
      state.communicationLayer = new SocketService({
        communicationLayerPreference,
        otherPublicKey,
        reconnect,
        transports: state.transports,
        communicationServerUrl,
        context: state.context,
        ecies,
        logging: state.logging,
      });
      break;
    default:
      throw new Error('Invalid communication protocol');
  }

  let url = (typeof document !== 'undefined' && document.URL) || '';
  let title = (typeof document !== 'undefined' && document.title) || '';

  if (state.dappMetadata?.url) {
    url = state.dappMetadata.url;
  }

  if (state.dappMetadata?.name) {
    title = state.dappMetadata.name;
  }

  const originatorInfo: OriginatorInfo = {
    url,
    title,
    source: state.dappMetadata?.source,
    icon: state.dappMetadata?.base64Icon,
    platform: state.platformType,
    apiVersion: packageJson.version,
  };
  state.originatorInfo = originatorInfo;

  const eventsMapping: {
    [key in CommunicationLayerHandledEvents]: (...args: any[]) => void;
  } = {
    // TODO AUTHORIZED listeners is only added for backward compatibility with wallet < 7.3
    [EventType.AUTHORIZED]: handleAuthorizedEvent(instance),
    [EventType.MESSAGE]: handleMessageEvent(instance),
    [EventType.CLIENTS_CONNECTED]: handleClientsConnectedEvent(
      instance,
      communicationLayerPreference,
    ),
    [EventType.KEYS_EXCHANGED]: handleKeysExchangedEvent(
      instance,
      communicationLayerPreference,
    ),
    [EventType.SOCKET_DISCONNECTED]: handleSocketDisconnectedEvent(instance),
    [EventType.SOCKET_RECONNECT]: handleSocketReconnectEvent(instance),
    [EventType.CLIENTS_DISCONNECTED]: handleClientsDisconnectedEvent(
      instance,
      communicationLayerPreference,
    ),
    [EventType.CHANNEL_CREATED]: handleChannelCreatedEvent(instance),
    [EventType.CLIENTS_WAITING]: handleClientsWaitingEvent(instance),
  };

  for (const [eventType, handler] of Object.entries(eventsMapping)) {
    try {
      state.communicationLayer.on(eventType, handler);
    } catch (error) {
      console.error(`Error registering handler for ${eventType}:`, error);
    }
  }
}
