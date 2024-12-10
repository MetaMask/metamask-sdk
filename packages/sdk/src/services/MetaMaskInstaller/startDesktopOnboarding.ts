import MetaMaskOnboarding from '@metamask/onboarding';
import { logger } from '../../utils/logger';
import { Ethereum } from '../Ethereum';

/**
 * Initiates the MetaMask desktop onboarding process.
 *
 * This function destroys the existing Ethereum object and removes it from the window context,
 * effectively clearing any prior Ethereum-related state. It then instantiates a new MetaMaskOnboarding object
 * and starts the onboarding process for MetaMask on desktop platforms.
 *
 * @param instance The MetaMaskInstaller instance used for debugging purposes.
 * @returns Promise<void> This function returns a promise that resolves to void.
 */
export async function startDesktopOnboarding() {
  logger(
    `[MetamaskInstaller: startDesktopOnboarding() starting desktop onboarding`,
  );

  Ethereum.destroy();
  if (window.ethereum) {
    window.ethereum = undefined;
  }
  const onboardingExtension = new MetaMaskOnboarding();
  onboardingExtension.startOnboarding();
}
