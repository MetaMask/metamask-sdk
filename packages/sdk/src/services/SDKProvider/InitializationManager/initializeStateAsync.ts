import { MetaMaskInpageProvider } from '@metamask/providers';
import { SDKProvider } from '../../../provider/SDKProvider';
import { getStorageManager } from '../../../storage-manager/getStorageManager';
import { logger } from '../../../utils/logger';

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
      accounts: null,
      autoRequestAccounts: false,
      providerStateRequested: false,
      chainId: '',
    };
  }

  const { state } = instance;
  // Replace super.initialState logic to automatically request account if not found in providerstate.
  let initialState: Parameters<MetaMaskInpageProvider['_initializeState']>[0];

  if (state.providerStateRequested) {
    logger(
      `[SDKProvider: initializeStateAsync()] initialization already in progress`,
    );
  } else {
    state.providerStateRequested = true;

    let cachedChainId: undefined | string;
    let cachedSelectedAddress: null | string = null;
    let relayPersistence = false;

    let useCache = false;
    const storageManager = getStorageManager({ enabled: true });

    // FIXME: currently set for backward compatibility so new sdk don't autoconnect with old wallet
    // Only use cache if relayPersistence is enabled for current channel.
    if (storageManager) {
      // Try to initialize optimistacally with cached value which would be updated once wallet is fully connected.
      const channelConfig = await storageManager.getPersistedChannelConfig({});
      relayPersistence = channelConfig?.relayPersistence ?? false;
      cachedChainId = await storageManager.getCachedChainId();
      const cachedAccounts = await storageManager.getCachedAccounts();
      if (cachedAccounts.length > 0) {
        cachedSelectedAddress = cachedAccounts[0];
      }
    }

    logger(
      `[SDKProvider: initializeStateAsync()] relayPersistence=${relayPersistence}`,
      {
        relayPersistence,
        cachedChainId,
        cachedSelectedAddress,
      },
    );

    if (relayPersistence) {
      if (cachedChainId && cachedSelectedAddress) {
        initialState = {
          accounts: [cachedSelectedAddress],
          chainId: cachedChainId,
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

    if (initialState?.accounts?.length === 0) {
      if (instance.getSelectedAddress()) {
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
