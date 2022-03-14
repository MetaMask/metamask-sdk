import MetaMaskOnboarding from '@metamask/onboarding';
import WalletConnect from '../services/WalletConnect';
import { waitPromise } from '../utils';
import { isMetaMaskInstalled, isMetaMaskMobileWebView, isMobile } from '.';
// ethereum.on('connect', handler: (connectInfo: ConnectInfo) => void);
// ethereum.on('disconnect', handler: (error: ProviderRpcError) => void);

const ManageMetaMaskInstallation = {
  isInstalling: false,
  hasInstalled: false,
  resendRequest: null,
  async redirectToProperInstall() {
    // If it's running on our mobile in-app browser but communication is still not working
    if (isMetaMaskMobileWebView()) {
      // eslint-disable-next-line no-alert
      alert('Please save your seedphrase and try to reinstall MetaMask Mobile');
      return false;
    }

    // If is not installed and is Extension, start Extension onboarding
    if (!isMobile()) {
      this.isInstalling = true;
      delete window.ethereum;
      const onboardingExtension = new MetaMaskOnboarding();
      onboardingExtension.startOnboarding();
      return false;
    }

    // If is not installed and is Mobile, start Mobile onboarding
    if (isMobile()) {
      this.isInstalling = true;
      const startedWCConncetion = await WalletConnect.startConnection();
      if (startedWCConncetion) {
        this.isInstalling = false;
        this.hasInstalled = true;
      }
      return startedWCConncetion;
    }

    return false;
  },
  async checkInstallation() {
    const isInstalled = isMetaMaskInstalled();

    // No need to do anything
    if (isInstalled) {
      return true;
    }

    return this.redirectToProperInstall();
  },
  async start({ wait = false }) {
    // Give enough time for providers to make connection
    if (wait) {
      await waitPromise(1000);
    }

    return this.checkInstallation();
  },
};

export default ManageMetaMaskInstallation;
