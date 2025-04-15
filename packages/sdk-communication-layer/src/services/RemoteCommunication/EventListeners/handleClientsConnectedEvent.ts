import { SendAnalytics } from '@metamask/analytics-client';
import { TrackingEvents } from '@metamask/sdk-types';
import packageJson from '../../../../package.json';
import { RemoteCommunication } from '../../../RemoteCommunication';
import { EventType } from '../../../types/EventType';
import { logger } from '../../../utils/logger';

/**
 * Creates and returns an event handler function for the "CLIENTS_CONNECTED" event. This handler function manages the connected clients for a given RemoteCommunication instance.
 *
 * When clients successfully connect:
 * 1. If debugging is enabled, the event details (channel ID and keys exchanged status) are logged for diagnostics.
 * 2. If analytics tracking is enabled, the analytics data is collected and sent to the server. This data includes the SDK version, wallet version, communication layer version, and other relevant information.
 * 3. The state of the RemoteCommunication instance is updated to reflect that clients have successfully connected and that the originator information hasn't been sent yet.
 * 4. The "CLIENTS_CONNECTED" event is emitted to inform other parts of the system about the successful connection of clients.
 *
 * @param instance The instance of RemoteCommunication for which the event handler function is being created.
 * @returns A function that acts as the event handler for the "CLIENTS_CONNECTED" event.
 */
export function handleClientsConnectedEvent(instance: RemoteCommunication) {
  return () => {
    const { state } = instance;
    // Propagate the event to manage different loading states on the ui.
    logger.RemoteCommunication(
      `[RemoteCommunication: handleClientsConnectedEvent()] on 'clients_connected' channel=${
        state.channelId
      } keysExchanged=${state.communicationLayer?.getKeyInfo()?.keysExchanged}`,
    );

    if (state.analytics && state.channelId) {
      SendAnalytics(
        {
          id: state.channelId,
          event: state.isOriginator
            ? TrackingEvents.REQUEST
            : TrackingEvents.RECONNECT,
          ...state.originatorInfo,
          sdkVersion: state.sdkVersion,
          walletVersion: state.walletInfo?.version,
          commLayerVersion: packageJson.version,
        },
        state.analyticsServerUrl,
      ).catch((err: unknown) => {
        console.error(`Cannot send analytics`, err);
      });
    }

    state.clientsConnected = true;
    state.originatorInfoSent = false; // Always re-send originator info.
    instance.emit(EventType.CLIENTS_CONNECTED);
  };
}
