import packageJson from '../../../package.json';
import { SendAnalytics } from '../../Analytics';
import { RemoteCommunication } from '../../RemoteCommunication';
import { CommunicationLayerPreference } from '../../types/CommunicationLayerPreference';
import { ConnectionStatus } from '../../types/ConnectionStatus';
import { MessageType } from '../../types/MessageType';
import { OriginatorInfo } from '../../types/OriginatorInfo';
import { TrackingEvents } from '../../types/TrackingEvent';
import { setLastActiveDate } from '../StateManger';

export function handleKeysExchangedEvent(
  instance: RemoteCommunication,
  communicationLayerPreference: CommunicationLayerPreference,
) {
  return (message: {
    isOriginator: boolean;
    originatorInfo: OriginatorInfo;
    originator: OriginatorInfo;
  }) => {
    if (instance.state.debug) {
      console.debug(
        `RemoteCommunication::${instance.state.context}::on commLayer.'keys_exchanged' channel=${instance.state.channelId}`,
        message,
      );
    }

    if (instance.state.communicationLayer?.getKeyInfo()?.keysExchanged) {
      instance.setConnectionStatus(ConnectionStatus.LINKED);
    }

    setLastActiveDate(instance, new Date());

    if (instance.state.analytics && instance.state.channelId) {
      SendAnalytics(
        {
          id: instance.state.channelId,
          event: TrackingEvents.CONNECTED,
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

    instance.state.isOriginator = message.isOriginator;

    if (!message.isOriginator) {
      // Don't send originator message from wallet.
      // Always Tell the DAPP metamask is ready
      // the dapp will send originator message when receiving ready.
      instance.state.communicationLayer?.sendMessage({
        type: MessageType.READY,
      });
      instance.state.ready = true;
      instance.state.paused = false;
    }

    // Keep sending originator info from this location for backward compatibility
    if (message.isOriginator && !instance.state.originatorInfoSent) {
      // Always re-send originator info in case the session was deleted on the wallet
      instance.state.communicationLayer?.sendMessage({
        type: MessageType.ORIGINATOR_INFO,
        originatorInfo: instance.state.originatorInfo,
        originator: instance.state.originatorInfo,
      });
      instance.state.originatorInfoSent = true;
    }
  };
}
