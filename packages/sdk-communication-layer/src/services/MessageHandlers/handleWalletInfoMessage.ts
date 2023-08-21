import { RemoteCommunication } from '../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../types/CommunicationLayerMessage';

export function handleWalletInfoMessage(
  instance: RemoteCommunication,
  message: CommunicationLayerMessage,
) {
  instance.state.walletInfo = message.walletInfo;
  instance.state.paused = false;

  // FIXME Remove comment --- but keep temporarily for reference in case of quick rollback
  // if ('6.6'.localeCompare(instance.state.walletInfo?.version || '') === 1) {
  //   // SIMULATE AUTHORIZED EVENT
  //   // FIXME remove hack as soon as ios release 7.x is out
  //   instance.state.authorized = true;
  //   emit(EventType.AUTHORIZED);

  //   if (instance.state.debug) {
  //     // Check for backward compatibility
  //     console.debug(
  //       `wallet version ${instance.state.walletInfo?.version} -- Force simulate AUTHORIZED event`,
  //       instance.state.walletInfo,
  //     );
  //   }
  // }
}
