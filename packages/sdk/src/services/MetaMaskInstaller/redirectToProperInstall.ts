import { PlatformType } from '@metamask/sdk-communication-layer';
import { logger } from '../../utils/logger';
import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';

/**
 * Redirects the user to the appropriate MetaMask installation method based on the platform type.
 *
 * The function determines the platform type using the platformManager of the provided MetaMaskInstaller state.
 * If the platform is a MetaMask Mobile Webview, the function returns false, as no installation is needed.
 * For desktop web platforms, the function initiates the desktop onboarding process if `preferDesktop` is true.
 * If none of these conditions are met, it initiates a remote connection for MetaMask installation.
 *
 * @param instance The MetaMaskInstaller instance used to determine platform type and initiate appropriate installation methods.
 * @returns Promise<boolean> Returns a promise that resolves to true if installation or remote connection is successful, and false otherwise.
 * @throws Throws an error if the remote startConnection fails.
 */
export async function redirectToProperInstall(instance: MetaMaskInstaller) {
  const { state } = instance;

  const platformType = state.platformManager?.getPlatformType();

  logger(
    `[MetamaskInstaller: redirectToProperInstall()] platform=${platformType}`,
  );

  // If it's running on our mobile in-app browser but communication is still not working
  if (platformType === PlatformType.MetaMaskMobileWebview) {
    return false;
  }

  // If is not installed, start remote connection
  state.isInstalling = true;
  try {
    await state.remote?.startConnection();

    state.isInstalling = false;
    state.hasInstalled = true;
  } catch (err) {
    state.isInstalling = false;
    throw err;
  }

  return true;
}
