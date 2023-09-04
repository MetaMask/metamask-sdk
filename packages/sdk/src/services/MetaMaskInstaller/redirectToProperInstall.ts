import { PlatformType } from '@metamask/sdk-communication-layer';
import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';

/**
 * Redirects the user to the appropriate MetaMask installation method based on the platform type.
 *
 * The function determines the platform type using the platformManager of the provided MetaMaskInstaller instance.
 * If the platform is a MetaMask Mobile Webview, the function returns false, as no installation is needed.
 * For desktop web platforms, the function initiates the desktop onboarding process if `preferDesktop` is true.
 * If none of these conditions are met, it initiates a remote connection for MetaMask installation.
 *
 * @param instance The MetaMaskInstaller instance used to determine platform type and initiate appropriate installation methods.
 * @returns Promise<boolean> Returns a promise that resolves to true if installation or remote connection is successful, and false otherwise.
 * @throws Throws an error if the remote startConnection fails.
 */
export async function redirectToProperInstall(instance: MetaMaskInstaller) {
  const platformType = instance.platformManager.getPlatformType();

  if (instance?.debug) {
    console.debug(
      `MetamaskInstaller::redirectToProperInstall() platform=${platformType} instance.preferDesktop=${instance.preferDesktop}`,
    );
  }

  // If it's running on our mobile in-app browser but communication is still not working
  if (platformType === PlatformType.MetaMaskMobileWebview) {
    return false;
  }

  // If is not installed and is Extension, start Extension onboarding
  if (platformType === PlatformType.DesktopWeb) {
    instance.isInstalling = true;
    if (instance.preferDesktop) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      instance.startDesktopOnboarding();
      return false;
    }
  }

  // If is not installed, start remote connection
  instance.isInstalling = true;
  try {
    await instance.remote.startConnection();

    // eslint-disable-next-line require-atomic-updates
    instance.isInstalling = false;
    // eslint-disable-next-line require-atomic-updates
    instance.hasInstalled = true;
  } catch (err) {
    // eslint-disable-next-line require-atomic-updates
    instance.isInstalling = false;
    throw err;
  }

  return true;
}
