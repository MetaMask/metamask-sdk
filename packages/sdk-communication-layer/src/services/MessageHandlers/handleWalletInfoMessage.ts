import { RemoteCommunicationState } from '../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../types/CommunicationLayerMessage';

export function handleWalletInfoMessage(
  state: RemoteCommunicationState,
  message: CommunicationLayerMessage,
) {
  state.walletInfo = message.walletInfo;
  state.paused = false;

  // FIXME Remove comment --- but keep temporarily for reference in case of quick rollback
  // if ('6.6'.localeCompare(state.walletInfo?.version || '') === 1) {
  //   // SIMULATE AUTHORIZED EVENT
  //   // FIXME remove hack as soon as ios release 7.x is out
  //   state.authorized = true;
  //   emit(EventType.AUTHORIZED);

  //   if (state.debug) {
  //     // Check for backward compatibility
  //     console.debug(
  //       `wallet version ${state.walletInfo?.version} -- Force simulate AUTHORIZED event`,
  //       state.walletInfo,
  //     );
  //   }
  // }
}
