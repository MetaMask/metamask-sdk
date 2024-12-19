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
export declare function initializeStateAsync(instance: SDKProvider): Promise<void>;
//# sourceMappingURL=initializeStateAsync.d.ts.map