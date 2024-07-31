import { ECIESProps } from '../../../ECIES';
import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerPreference } from '../../../types/CommunicationLayerPreference';
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
export declare function initCommunicationLayer({ communicationLayerPreference, otherPublicKey, reconnect, ecies, communicationServerUrl, instance, }: {
    communicationLayerPreference: CommunicationLayerPreference;
    otherPublicKey?: string;
    reconnect?: boolean;
    ecies?: ECIESProps;
    communicationServerUrl?: string;
    instance: RemoteCommunication;
}): void;
//# sourceMappingURL=initCommunicationLayer.d.ts.map