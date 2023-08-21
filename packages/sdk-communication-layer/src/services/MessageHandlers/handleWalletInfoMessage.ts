import { RemoteCommunication } from '../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../types/CommunicationLayerMessage';

/**
 * Handles the 'walletInfo' message for a `RemoteCommunication` instance.
 *
 * When a 'walletInfo' message is received, this function is responsible for updating the current `RemoteCommunication`
 * instance's state with the received wallet information and resetting the paused state of the instance.
 *
 * The sequence of actions taken on receiving a 'walletInfo' message is as follows:
 *
 * 1. Update the `walletInfo` property of the instance's state with the `walletInfo` received in the message.
 * 2. Reset the `paused` status of the instance to `false`.
 *
 * Previously, there was some additional code (commented out) that handled a specific backward compatibility scenario.
 * When the wallet version was less than '6.6', an AUTHORIZED event was simulated, ensuring compatibility with older
 * versions. This backward compatibility code has been deprecated and is preserved in comments for reference purposes.
 *
 * @param instance The `RemoteCommunication` instance that needs to be acted upon when a walletInfo message is received.
 * @param message The `CommunicationLayerMessage` object containing the wallet information.
 */
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
