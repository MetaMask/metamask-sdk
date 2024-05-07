import { MetaMaskInpageProvider } from '@metamask/providers';
import { logger } from '../../../utils/logger';
import { SDKProvider } from '../../../provider/SDKProvider';
import {
  STORAGE_DAPP_CHAINID,
  STORAGE_DAPP_SELECTED_ADDRESS,
} from '../../../config';

const hasLocalStorage = typeof localStorage !== 'undefined';

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
  // Don't remove this logic, it's required to initialize the state in some cases.
  if (instance.state === undefined) {
    /**
     * The Workaround: Initializing the state here to address an issue where properties
     * were not set before this method was invoked, possibly by the parent class, leading to
     * unexpected behavior.
     *
     */
    instance.state = {
      autoRequestAccounts: false,
      providerStateRequested: false,
      chainId: '',
    };
  }

  const { state } = instance;

  logger(
    `[SDKProvider: initializeStateAsync()] initialize state async started`,
  );

  if (state.providerStateRequested) {
    logger(
      `[SDKProvider: initializeStateAsync()] initialization already in progress`,
    );
  } else {
    state.providerStateRequested = true;

    // Replace super.initialState logic to automatically request account if not found in providerstate.
    let initialState: Parameters<MetaMaskInpageProvider['_initializeState']>[0];

    let rawCachedChainId: null | string = null;
    let rawSelectedAddress: null | string = null;
    let relayPersistence = false;

    let useCache = false;
    // FIXME: currently set for backward compatibility so new sdk don't autoconnect with old wallet
    // Only use cache if relayPersistence is enabled for current channel.
    if (hasLocalStorage) {
      // Try to initialize optimistacally with cached value which would be updated once wallet is fully connected.
      rawCachedChainId = localStorage.getItem(STORAGE_DAPP_CHAINID);
      rawSelectedAddress = localStorage.getItem(STORAGE_DAPP_SELECTED_ADDRESS);
      relayPersistence =
        JSON.parse(localStorage.getItem('.sdk-comm') ?? '{}')
          .relayPersistence ?? false;
    }

    logger('[SDKProvider: initializeStateAsync()] relayPersistence', {
      relayPersistence,
      rawCachedChainId,
      rawSelectedAddress,
    });

    if (relayPersistence) {
      if (rawCachedChainId && rawSelectedAddress) {
        initialState = {
          accounts: [JSON.parse(rawSelectedAddress) as string],
          chainId: JSON.parse(rawCachedChainId) as string,
          isUnlocked: false,
        };

        useCache = true;
      } else {
        try {
          initialState = (await instance.request({
            method: 'metamask_getProviderState',
          })) as Parameters<MetaMaskInpageProvider['_initializeState']>[0];
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
      }
    }

    logger(
      `[SDKProvider: initializeStateAsync()] state selectedAddress=${instance.getSelectedAddress()} `,
      initialState,
    );

    if (initialState?.accounts?.length === 0) {
      logger(
        `[SDKProvider: initializeStateAsync()] initial state doesn't contain accounts`,
      );

      if (instance.getSelectedAddress()) {
        logger(
          `[SDKProvider: initializeStateAsync()] using instance.selectedAddress instead`,
        );

        initialState.accounts = [instance.getSelectedAddress() as string];
      } else {
        logger(
          `[SDKProvider: initializeStateAsync()] Fetch accounts remotely.`,
        );

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

    if (useCache) {
      // Force isConnected to true to avoid unnecessary request to metamask.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      instance._state.isConnected = true;
      instance.emit('connect', { chainId: initialState?.chainId });
    }
  }
}
