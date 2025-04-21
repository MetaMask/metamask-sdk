import { TrackingEvent } from '@metamask/sdk-types';
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
    link,
    preferDesktop: state.preferDesktop,
    installer: options.getMetaMaskInstaller(),
    terminate: () => {
      logger(
        `[RemoteConnection: showInstallModal() => terminate()] terminate connection`,
      );

      // Terminate with specific error code
      options.sdk.terminate().catch((err) => {
        console.warn(`[MMSDK] failed to terminate connection`, err);
      });
    },
    debug: state.developerMode,
    connectWithExtension: () => {
      options.connectWithExtensionProvider?.();
      return false;
    },
    onAnalyticsEvent: ({
      event,
      params,
    }: {
      event: TrackingEvent;
      params?: Record<string, unknown>;
    }) => {
      const extended = {
        ...params,
        sdkVersion: options.sdk.getVersion(),
        dappId: options.dappMetadata?.name,
        source: options._source,
        url: options.dappMetadata?.url,
      };
      state.analytics?.send({ event, params: extended });
    },
  });
  state.installModal?.mount?.(link);
}
