import { RPC_METHODS } from '../../../config';
import { MetaMaskSDK } from '../../../sdk';

/**
 * Asynchronously connects to MetaMask, requests account access and sign message.
 *
 * This function first checks whether the MetaMaskSDK instance is initialized.
 * If not, it initializes the instance. It then makes a request to access accounts
 * and the sign the message with the first account.
 *
 * @param instance The MetaMaskSDK instance to connect to.
 * @returns Promise resolving to the result of personal_sign on the msg.
 * @throws Error if the activeProvider is undefined.
 */
export async function connectAndSign({
  instance,
  msg,
}: {
  instance: MetaMaskSDK;
  msg: string;
}) {
  if (!instance._initialized) {
    if (instance.debug) {
      console.log(
        `SDK::connectAndSign() provider not ready -- wait for init()`,
      );
    }
    await instance.init();
  }

  if (instance.debug) {
    console.debug(`SDK::connectAndSign() msg: ${msg}`, instance.activeProvider);
  }

  if (!instance.activeProvider) {
    throw new Error(`SDK state invalid -- undefined provider`);
  }

  return instance.activeProvider.request({
    method: RPC_METHODS.METAMASK_CONNECTSIGN,
    params: [msg],
  });
}
