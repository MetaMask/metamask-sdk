import { MetaMaskSDK } from '../../../sdk';

/**
 * Asynchronously connects to MetaMask and requests account access.
 *
 * This function first checks whether the MetaMaskSDK instance is initialized.
 * If not, it initializes the instance. It then makes a request to access accounts
 * using the active provider. Throws an error if the provider is undefined.
 *
 * @param instance The MetaMaskSDK instance to connect to.
 * @returns Promise resolving to the result of the 'eth_requestAccounts' request.
 * @throws Error if the activeProvider is undefined.
 */
export async function connect(instance: MetaMaskSDK) {
  if (!instance._initialized) {
    if (instance.debug) {
      console.log(`SDK::connect() provider not ready -- wait for init()`);
    }
    await instance.init();
  }

  if (instance.debug) {
    console.debug(`SDK::connect()`, instance.activeProvider);
  }

  if (!instance.activeProvider) {
    throw new Error(`SDK state invalid -- undefined provider`);
  }

  return instance.activeProvider.request({
    method: 'eth_requestAccounts',
    params: [],
  });
}
