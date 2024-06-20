import { logger } from '../../../utils/logger';
import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';

/**
 * Display the installation modal
 *
 * @param param.link link of the qrcode
 * @returns
 */
export function showInstallModal(
  state: RemoteConnectionState,
  options: RemoteConnectionProps,
  link: string,
): void {
  state.installModal = options.modals.install?.({
    i18nInstance: options.sdk.i18nInstance,
    link,
    preferDesktop: state.preferDesktop,
    installer: options.getMetaMaskInstaller(),
    terminate: () => {
      logger(
        `[RemoteConnection: showInstallModal() => terminate()] terminate connection`,
      );

      // Terminate with specific error code
      options.sdk.terminate();
    },
    debug: state.developerMode,
    connectWithExtension: () => {
      options.connectWithExtensionProvider?.();
      return false;
    },
  });
  state.installModal?.mount?.(link);
}
