import { analytics } from '@metamask/sdk-analytics';
import { EventType } from '@metamask/sdk-communication-layer';
import { logger } from '../../../utils/logger';
import { PROVIDER_UPDATE_TYPE } from '../../../types/ProviderUpdateType';
import { showInstallModal } from '../ModalManager/showInstallModal';
import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';
import {
  METAMASK_CONNECT_BASE_URL,
  METAMASK_DEEPLINK_BASE,
} from '../../../constants';

/**
 * Handles the disconnection process for a MetaMask connection based on the current state and provided options.
 *
 * @param state Current state of the RemoteConnection class instance.
 * @param options Configuration options for the disconnection.
 * @returns Promise<void>
 */
export async function connectWithModalInstaller(
  state: RemoteConnectionState,
  options: RemoteConnectionProps,
  linkParams: string,
) {
  return new Promise<void>((resolve, reject) => {
    if (!state.connector) {
      reject(new Error('No connector available'));
      return;
    }

    logger(`[RemoteConnection: connectWithModalInstaller()]`, {
      state,
      options,
      linkParams,
    });

    const installLink = `${
      state.useDeeplink ? METAMASK_DEEPLINK_BASE : METAMASK_CONNECT_BASE_URL
    }?${linkParams}`;
    showInstallModal(state, options, installLink);

    // Event means browser extension is selected, interrupt gracefully.
    options.sdk.once(
      EventType.PROVIDER_UPDATE,
      async (type: PROVIDER_UPDATE_TYPE) => {
        // handle the provider change in initializeProvider
        logger(
          `[RemoteConnection: connectWithModalInstaller()] once provider_update -- resolving startConnection promise`,
        );

        if (type === PROVIDER_UPDATE_TYPE.TERMINATE) {
          const rejected = {
            code: 4001,
            message: 'User rejected the request.',
          };
          reject(rejected);
          return;
        }
        reject(type);
      },
    );

    const connectionTimeout = setTimeout(() => {
      analytics.track('sdk_connection_failed', {
        transport_type: 'websocket',
      });
    }, 60_000);

    state.connector.once(EventType.AUTHORIZED, () => {
      clearTimeout(connectionTimeout);
      resolve();
    });

    state.connector.once(EventType.REJECTED, () => {
      clearTimeout(connectionTimeout);
      reject(EventType.REJECTED);
    });

    state.connector.once(EventType.CLIENTS_READY, async () => {
      logger(
        `[RemoteConnection: connectWithModalInstaller()] once clients_ready -- resolving startConnection promise`,
      );

      // Allow initializeProvider to complete and send the eth_requestAccounts
      resolve();
    });
  });
}
