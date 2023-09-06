import { BaseProvider } from '@metamask/providers';
import { SDKProvider } from '../../../provider/SDKProvider';

/**
 * Asynchronously initializes the state of an SDKProvider instance.
 *
 * The function performs multiple operations to ensure the state of the SDKProvider instance
 * is properly initialized. If debug mode is enabled, it logs the process to the console.
 *
 * - Checks if an initialization is already in progress to avoid redundant calls.
 * - Fetches the initial provider state via the 'metamask_getProviderState' request.
 * - If the initial state lacks account information, attempts to use `instance.selectedAddress` or makes a remote 'eth_requestAccounts' call to populate the accounts.
 *
 * @param instance The SDKProvider instance whose state is to be initialized asynchronously.
 * @returns Promise<void>
 * @throws Error if the initialization fails.
 */
export async function initializeStateAsync(instance: SDKProvider) {
  const { state } = instance;

  if (state.debug) {
    console.debug(`SDKProvider::_initializeStateAsync()`);
  }

  if (state.providerStateRequested) {
    if (state.debug) {
      console.debug(
        `SDKProvider::_initializeStateAsync() initialization already in progress`,
      );
    }
  } else {
    state.providerStateRequested = true;
    // Replace super.initialState logic to automatically request account if not found in providerstate.
    let initialState: Parameters<BaseProvider['_initializeState']>[0];
    try {
      initialState = (await instance.request({
        method: 'metamask_getProviderState',
      })) as Parameters<BaseProvider['_initializeState']>[0];
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      instance._log.error(
        'MetaMask: Failed to get initial state. Please report this bug.',
        error,
      );
      state.providerStateRequested = false;
      return;
    }

    if (state.debug) {
      console.debug(
        `SDKProvider::_initializeStateAsync state selectedAddress=${instance.selectedAddress} `,
        initialState,
      );
    }

    if (initialState?.accounts?.length === 0) {
      if (state.debug) {
        console.debug(
          `SDKProvider::_initializeStateAsync initial state doesn't contain accounts`,
        );
      }

      if (instance.selectedAddress) {
        if (state.debug) {
          console.debug(
            `SDKProvider::_initializeStateAsync using instance.selectedAddress instead`,
          );
        }

        initialState.accounts = [instance.selectedAddress];
      } else {
        if (state.debug) {
          console.debug(
            `SDKProvider::_initializeStateAsync Fetch accounts remotely.`,
          );
        }

        const accounts = (await instance.request({
          method: 'eth_requestAccounts',
          params: [],
        })) as string[];
        initialState.accounts = accounts;
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    instance._initializeState(initialState);
    state.providerStateRequested = false;
  }
}
