import { logger } from '../../../utils/logger';
import { MetaMaskSDK } from '../../../sdk';
import { RPC_METHODS } from '../../../config';

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
export async function connect(instance: MetaMaskSDK): Promise<string[]> {
  if (!instance._initialized) {
    logger(`[MetaMaskSDK: connect()] provider not ready -- wait for init()`);

    await instance.init();
  }

  logger(
    `[MetaMaskSDK: connect()] isExtensionActive=${instance.isExtensionActive()} activeProvider`,
    instance.activeProvider,
  );

  if (!instance.activeProvider) {
    throw new Error(`SDK state invalid -- undefined provider`);
  }

  const selectedAddress = instance.activeProvider.getSelectedAddress();
  if (selectedAddress) {
    return [selectedAddress];
  }

  // TODO: enable once MetaMask Mobile v7.21 is out in store.
  // It would still work on older wallet but the connection modal may be trigger twice.
  // return instance.activeProvider.request({
  //   method: RPC_METHODS.WALLET_REQUESTPERMISSIONS,
  //   params: [
  //     {
  //       eth_accounts: {},
  //     },
  //   ],
  // });
  return instance.activeProvider.request<string[]>({
    method: RPC_METHODS.ETH_REQUESTACCOUNTS,
    params: [],
  }) as Promise<string[]>;
}
