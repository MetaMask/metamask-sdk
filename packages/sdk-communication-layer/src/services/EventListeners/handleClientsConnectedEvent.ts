import packageJson from '../../../package.json';
import { SendAnalytics } from '../../Analytics';
import { RemoteCommunication } from '../../RemoteCommunication';
import { CommunicationLayerPreference } from '../../types/CommunicationLayerPreference';
import { EventType } from '../../types/EventType';
import { TrackingEvents } from '../../types/TrackingEvent';

export function handleClientsConnectedEvent(
  instance: RemoteCommunication,
  communicationLayerPreference: CommunicationLayerPreference,
) {
  return () => {
    // Propagate the event to manage different loading states on the ui.
    if (instance.state.debug) {
      console.debug(
        `RemoteCommunication::on 'clients_connected' channel=${
          instance.state.channelId
        } keysExchanged=${
          instance.state.communicationLayer?.getKeyInfo()?.keysExchanged
        }`,
      );
    }

    if (instance.state.analytics) {
      SendAnalytics(
        {
          id: instance.state.channelId ?? '',
          event: TrackingEvents.REQUEST,
          ...instance.state.originatorInfo,
          commLayer: communicationLayerPreference,
          sdkVersion: instance.state.sdkVersion,
          walletVersion: instance.state.walletInfo?.version,
          commLayerVersion: packageJson.version,
        },
        instance.state.communicationServerUrl,
      ).catch((err) => {
        console.error(`Cannot send analytics`, err);
      });
    }

    instance.state.clientsConnected = true;
    instance.state.originatorInfoSent = false; // Always re-send originator info.
    instance.emit(EventType.CLIENTS_CONNECTED);
  };
}
