import { RemoteCommunication } from '../../RemoteCommunication';
import { EventType } from '../../types/EventType';
import { PlatformType } from '../../types/PlatformType';
import { wait } from '../../utils/wait';

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
