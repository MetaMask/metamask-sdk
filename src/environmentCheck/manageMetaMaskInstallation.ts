import MetaMaskOnboarding from '@metamask/onboarding';
import { isMetaMaskInstalled, isMetaMaskMobileWebView, isMobile } from '.';

const wait = (time) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(true), time);
  });

const manageMetaMaskInstallation = async () => {
  // Give enough time for providers to make connection
  await wait(1000);
  const isInstalled = isMetaMaskInstalled();

  // No need to do anything
  if (isInstalled) {
    return true;
  }

  // If it's running on our mobile in-app browser but communication is still not working
  if (isMetaMaskMobileWebView()) {
    // eslint-disable-next-line no-alert
    return alert(
      'Please save your seedphrase and try to reinstall MetaMask Mobile',
    );
  }

  // If is not installed and is Extension, start Extension onboarding
  if (!isMobile()) {
    delete window.ethereum;
    const onboardingExtension = new MetaMaskOnboarding();
    onboardingExtension.startOnboarding();
  }

  // If is not installed and is Mobile, start Mobile onboarding
  if (isMobile()) {
    return alert('Start MM Mobile installation');
  }

  return false;
};

export default manageMetaMaskInstallation;
