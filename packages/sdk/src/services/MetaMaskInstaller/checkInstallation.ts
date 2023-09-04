import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';

/**
 * Checks for the installation of the MetaMask extension and redirects to the installation page if not installed.
 *
 * The function first verifies if MetaMask is already installed using the platformManager of the given MetaMaskInstaller instance.
 * If MetaMask is installed, the function returns true. If not, it triggers a redirection to the appropriate installation page.
 *
 * @param instance The MetaMaskInstaller instance used to check installation and perform redirection.
 * @returns Promise<boolean> Returns a promise that resolves to true if MetaMask is installed, otherwise redirects to the installation page.
 */
export async function checkInstallation(instance: MetaMaskInstaller) {
  const isInstalled = instance.platformManager.isMetaMaskInstalled();

  if (instance.debug) {
    console.log(
      `MetamaskInstaller::checkInstallation() isInstalled=${isInstalled}`,
    );
  }

  // No need to do anything
  if (isInstalled) {
    return true;
  }

  return await instance.redirectToProperInstall();
}
