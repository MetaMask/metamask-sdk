import { EventType } from '@metamask/sdk-communication-layer';
import { PROVIDER_UPDATE_TYPE } from '../../../types/ProviderUpdateType';
import { showInstallModal } from '../ModalManager/showInstallModal';
import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';
import { METAMASK_CONNECT_BASE_URL } from '../../../constants';

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
      return;
    }

    const universalLink = `${METAMASK_CONNECT_BASE_URL}?${linkParams}`;
    showInstallModal(state, options, universalLink);

    // Event means browser extension is selected, interrupt gracefully.
    options.sdk.once(
      EventType.PROVIDER_UPDATE,
      async (type: PROVIDER_UPDATE_TYPE) => {
        // handle the provider change in initializeProvider
        if (state.developerMode) {
          console.debug(
            `RemoteConnection::startConnection::on 'provider_update' -- resolving startConnection promise`,
          );
        }
        reject(type);
      },
    );

    // TODO shouldn't it make more sense to actually wait for full connection and 'authorized' event?
    state.connector.once(EventType.CLIENTS_READY, async () => {
      if (state.developerMode) {
        console.debug(
          `RemoteConnection::startConnection::on 'clients_ready' -- resolving startConnection promise`,
        );
      }

      // Allow initializeProvider to complete and send the eth_requestAccounts
      resolve();
    });
  });
}
