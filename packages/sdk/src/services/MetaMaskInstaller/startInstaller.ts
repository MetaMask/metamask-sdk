import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';
import { wait as waitPromise } from '../../utils/wait';

/**
 * Initiates the MetaMask installation process, optionally waiting for providers to establish a connection.
 *
 * The function first logs debug information if debugging is enabled. If the `wait` option is set to true,
 * it waits for a specified time (1 second by default) to allow providers to establish a connection.
 * After waiting or immediately (if `wait` is false), it proceeds to check for MetaMask installation.
 *
 * @param instance The MetaMaskInstaller instance responsible for checking MetaMask installation.
 * @param options An object containing a boolean `wait` property to indicate whether to wait for providers to establish a connection.
 * @returns Promise<boolean> Returns a promise that resolves to the result of `checkInstallation`, indicating whether MetaMask is installed.
 */
export async function startInstaller(
  instance: MetaMaskInstaller,
  { wait = false }: { wait: boolean },
) {
  if (instance.debug) {
    console.debug(`MetamaskInstaller::start() wait=${wait}`);
  }

  // Give enough time for providers to make connection
  if (wait) {
    await waitPromise(1000);
  }

  return await instance.checkInstallation();
}
