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
  // prevent double initialization
  if (state.installModal) {
    if (state.developerMode) {
      console.debug(
        `RemoteConnection::showInstallModal() install modal already initialized`,
        state.installModal,
      );
    }
    state.installModal.mount?.(link);
    return;
  }

  state.installModal = options.modals.install?.({
    link,
    installer: options.getMetaMaskInstaller(),
    terminate: () => {
      if (state.developerMode) {
        console.debug(
          `RemoteConnection::showInstallModal() terminate connection`,
        );
      }
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
