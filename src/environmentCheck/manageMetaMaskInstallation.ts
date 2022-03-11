import MetaMaskOnboarding from '@metamask/onboarding';
import { isMetaMaskInstalled, isMetaMaskMobileWebView, isMobile } from '.';

const redirectToProperInstall = () => {
  // If it's running on our mobile in-app browser but communication is still not working
  if (isMetaMaskMobileWebView()) {
    // eslint-disable-next-line no-alert
    alert('Please save your seedphrase and try to reinstall MetaMask Mobile');
    return false;
  }

  // If is not installed and is Extension, start Extension onboarding
  if (!isMobile()) {
    delete window.ethereum;
    const onboardingExtension = new MetaMaskOnboarding();
    onboardingExtension.startOnboarding();
    return true;
  }

  // If is not installed and is Mobile, start Mobile onboarding
  if (isMobile()) {
    return window.open('https://metamask.app.link', '_self');
  }

  return false;
};

const manageMetaMaskInstallation = () => {
  // Give enough time for providers to make connection
  setTimeout(() => {
    const isInstalled = isMetaMaskInstalled();

    // No need to do anything
    if (isInstalled) {
      return true;
    }

    return redirectToProperInstall();
  }, 1000);
};

export default manageMetaMaskInstallation;
