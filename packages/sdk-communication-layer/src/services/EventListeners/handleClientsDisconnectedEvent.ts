import packageJson from '../../../package.json';
import { SendAnalytics } from '../../Analytics';
import { RemoteCommunication } from '../../RemoteCommunication';
import { CommunicationLayerPreference } from '../../types/CommunicationLayerPreference';
import { ConnectionStatus } from '../../types/ConnectionStatus';
import { EventType } from '../../types/EventType';
import { TrackingEvents } from '../../types/TrackingEvent';

export function handleClientsDisconnectedEvent(
  instance: RemoteCommunication,
  communicationLayerPreference: CommunicationLayerPreference,
) {
  return (channelId: string) => {
    if (instance.state.debug) {
      console.debug(
        `RemoteCommunication::${instance.state.context}]::on 'clients_disconnected' channelId=${channelId}`,
      );
    }

    instance.state.clientsConnected = false;

    // Propagate the disconnect event to clients.
    instance.emit(EventType.CLIENTS_DISCONNECTED, instance.state.channelId);
    instance.setConnectionStatus(ConnectionStatus.DISCONNECTED);

    instance.state.ready = false;
    instance.state.authorized = false;

    if (instance.state.analytics && instance.state.channelId) {
      SendAnalytics(
        {
          id: instance.state.channelId,
          event: TrackingEvents.DISCONNECTED,
          sdkVersion: instance.state.sdkVersion,
          commLayer: communicationLayerPreference,
          commLayerVersion: packageJson.version,
          walletVersion: instance.state.walletInfo?.version,
        },
        instance.state.communicationServerUrl,
      ).catch((err) => {
        console.error(`Cannot send analytics`, err);
      });
    }
  };
}
