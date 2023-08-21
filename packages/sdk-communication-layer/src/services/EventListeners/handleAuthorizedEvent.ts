import { RemoteCommunication } from '../../RemoteCommunication';
import { EventType } from '../../types/EventType';
import { PlatformType } from '../../types/PlatformType';
import { wait } from '../../utils/wait';

/**
 * Creates and returns an event handler function for the "AUTHORIZED" event. The handler function manages the authorization process for the given RemoteCommunication instance.
 *
 * This function performs several tasks:
 * 1. Skips processing if the instance is already authorized.
 * 2. Ensures the wallet version info is available, polling if necessary.
 * 3. Implements backward compatibility for wallets with versions earlier than 7.3. It checks against a hardcoded version to decide whether to proceed with the event handling.
 * 4. Identifies if the platform is considered "secure" based on predefined platform types.
 * 5. If on a secure platform, the instance's state is updated to indicate it's authorized and the "AUTHORIZED" event is emitted.
 *
 * @param instance The instance of RemoteCommunication to be processed.
 * @returns A function which acts as the event handler for the "AUTHORIZED" event.
 */
export function handleAuthorizedEvent(instance: RemoteCommunication) {
  return async () => {
    if (instance.state.authorized) {
      // Ignore duplicate event or already authorized
      return;
    }

    // Sometime the wallet version is not yet received upon authorized message
    const waitForWalletVersion = async () => {
      while (!instance.state.walletInfo) {
        await wait(500);
      }
    };
    await waitForWalletVersion();

    // The event might be received twice because of a backward compatibility hack in SocketService.
    // bacward compatibility for wallet <7.3
    const compareValue = '7.3'.localeCompare(
      instance.state.walletInfo?.version || '',
    );

    if (instance.state.debug) {
      console.debug(
        `RemoteCommunication HACK 'authorized' version=${instance.state.walletInfo?.version} compareValue=${compareValue}`,
      );
    }

    // FIXME remove this hack pending wallet release 7.3+
    if (compareValue !== 1) {
      // ignore for version 7.3+
      return;
    }

    const isSecurePlatform =
      instance.state.platformType === PlatformType.MobileWeb ||
      instance.state.platformType === PlatformType.ReactNative ||
      instance.state.platformType === PlatformType.MetaMaskMobileWebview;

    if (instance.state.debug) {
      console.debug(
        `RemoteCommunication HACK 'authorized' platform=${instance.state.platformType} secure=${isSecurePlatform} channel=${instance.state.channelId} walletVersion=${instance.state.walletInfo?.version}`,
      );
    }

    if (isSecurePlatform) {
      // Propagate authorized event.
      instance.state.authorized = true;
      instance.emit(EventType.AUTHORIZED);
    }
  };
}
