import MetaMaskOnboarding from '@metamask/onboarding';
import { isMetaMaskInstalled, isMetaMaskMobileWebView, isMobile } from '.';

// ethereum.on('connect', handler: (connectInfo: ConnectInfo) => void);
// ethereum.on('disconnect', handler: (error: ProviderRpcError) => void);

const redirectToProperInstall = () => {
  // If it's running on our mobile in-app browser but communication is still not working
  if (isMetaMaskMobileWebView()) {
    // eslint-disable-next-line no-alert
    alert('Please save your seedphrase and try to reinstall MetaMask Mobile');
  }

  // If is not installed and is Extension, start Extension onboarding
  if (!isMobile()) {
    delete window.ethereum;
    const onboardingExtension = new MetaMaskOnboarding();
    onboardingExtension.startOnboarding();
  }

  // If is not installed and is Mobile, start Mobile onboarding
  if (isMobile()) {
    window.open('https://metamask.app.link', '_self');
  }

  return false;
};

const checkInstallation = () => {
  const isInstalled = isMetaMaskInstalled();

  // No need to do anything
  if (isInstalled) {
    return true;
  }

  return redirectToProperInstall();
};

const manageMetaMaskInstallation = ({ wait = false }) => {
  if (!wait) {
    return checkInstallation();
  }

  // Give enough time for providers to make connection
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(checkInstallation());
    }, 1000);
  });
};

export default manageMetaMaskInstallation;
